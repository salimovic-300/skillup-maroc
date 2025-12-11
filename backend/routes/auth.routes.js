const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  resendVerification
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// Validation rules
const registerValidation = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Minimum 8 caractères')
    .matches(/\d/).withMessage('Doit contenir un chiffre')
    .matches(/[A-Z]/).withMessage('Doit contenir une majuscule'),
  body('firstName')
    .trim()
    .notEmpty().withMessage('Prénom requis')
    .isLength({ max: 50 }).withMessage('Maximum 50 caractères'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Nom requis')
    .isLength({ max: 50 }).withMessage('Maximum 50 caractères'),
  body('dataConsent')
    .isBoolean().withMessage('Consentement requis')
    .equals('true').withMessage('Vous devez accepter les conditions')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

const passwordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Minimum 8 caractères')
    .matches(/\d/).withMessage('Doit contenir un chiffre')
    .matches(/[A-Z]/).withMessage('Doit contenir une majuscule')
];

// Routes publiques
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', body('email').isEmail(), validate, forgotPassword);
router.put('/reset-password/:token', passwordValidation, validate, resetPassword);

// Routes protégées
router.use(protect); // Toutes les routes suivantes nécessitent une authentification

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-password', [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  ...passwordValidation.map(v => v.withMessage(v._context?.message || ''))
], validate, updatePassword);
router.post('/resend-verification', resendVerification);

module.exports = router;
