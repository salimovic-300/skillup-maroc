const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, error: 'Non autorisé' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, error: 'Utilisateur non trouvé' });
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token invalide' });
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
    next();
  } catch (error) {
    next();
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ success: false, error: 'Accès admin requis' });
};

exports.isInstructor = (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) next();
  else res.status(403).json({ success: false, error: 'Accès instructeur requis' });
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Non autorisé pour ce rôle' });
    }
    next();
  };
};
