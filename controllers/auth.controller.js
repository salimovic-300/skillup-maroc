const crypto = require('crypto');
const User = require('../models/User.model');
const sendEmail = require('../utils/email.util');

// Helper: Envoyer token avec cookie
const sendTokenResponse = (user, statusCode, res, message = 'Succès') => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified
      }
    });
};

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, dataConsent } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      profile: { firstName, lastName },
      dataConsent,
      consentDate: dataConsent ? new Date() : null
    });

    // Générer token de vérification email
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Envoyer email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Vérifiez votre email - SkillUp Maroc',
        template: 'emailVerification',
        data: {
          name: firstName,
          verificationUrl
        }
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    sendTokenResponse(user, 201, res, 'Inscription réussie ! Vérifiez votre email.');

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est bloqué
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Compte bloqué. Réessayez dans ${lockTime} minutes.`
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Réinitialiser les tentatives et mettre à jour lastLogin
    await user.updateOne({
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 }
    });

    sendTokenResponse(user, 200, res, 'Connexion réussie');

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
};

// @desc    Déconnexion
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('enrolledCourses.course', 'title slug thumbnail');

  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Vérifier email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès'
    });

  } catch (error) {
    console.error('Erreur vérification email:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
};

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation de mot de passe - SkillUp Maroc',
        template: 'resetPassword',
        data: {
          name: user.profile.firstName,
          resetUrl
        }
      });

      res.status(200).json({
        success: true,
        message: 'Email de réinitialisation envoyé'
      });

    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      });
    }

  } catch (error) {
    console.error('Erreur forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// @desc    Réinitialiser mot de passe
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Mot de passe réinitialisé avec succès');

  } catch (error) {
    console.error('Erreur reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation'
    });
  }
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Vérifier l'ancien mot de passe
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Mot de passe mis à jour');

  } catch (error) {
    console.error('Erreur update password:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    });
  }
};

// @desc    Renvoyer email de vérification
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email déjà vérifié'
      });
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Vérifiez votre email - SkillUp Maroc',
      template: 'emailVerification',
      data: {
        name: user.profile.firstName,
        verificationUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email de vérification renvoyé'
    });

  } catch (error) {
    console.error('Erreur resend verification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi'
    });
  }
};
