const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Protéger les routes - Authentification requise
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier le header Authorization
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Ou vérifier le cookie
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expirée, veuillez vous reconnecter'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

// Autoriser certains rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource`
      });
    }
    next();
  };
};

// Vérifier que l'email est vérifié
exports.requireVerifiedEmail = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Veuillez vérifier votre email avant de continuer'
    });
  }
  next();
};

// Vérifier le consentement RGPD
exports.requireConsent = (req, res, next) => {
  if (!req.user.dataConsent) {
    return res.status(403).json({
      success: false,
      error: 'Consentement RGPD requis'
    });
  }
  next();
};

// Rate limiting par utilisateur
const userRequests = new Map();

exports.userRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    if (!req.user) return next();

    const userId = req.user._id.toString();
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const userData = userRequests.get(userId);
    
    if (now > userData.resetAt) {
      userRequests.set(userId, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (userData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Trop de requêtes, veuillez réessayer plus tard'
      });
    }

    userData.count++;
    next();
  };
};

// Optionnel - authentification non requise mais récupère l'user si présent
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (error) {
    // Ignorer les erreurs - l'utilisateur n'est simplement pas authentifié
  }

  next();
};
