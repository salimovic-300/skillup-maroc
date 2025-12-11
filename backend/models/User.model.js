const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  // Informations de base
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: [8, 'Minimum 8 caractères'],
    select: false // Ne pas retourner par défaut
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },

  // Profil
  profile: {
    firstName: { type: String, required: [true, 'Prénom requis'] },
    lastName: { type: String, required: [true, 'Nom requis'] },
    avatar: { type: String, default: 'default-avatar.png' },
    bio: { type: String, maxlength: 500 },
    phone: String,
    city: String,
    country: { type: String, default: 'Maroc' }
  },

  // Compétences (pour freelance)
  skills: [{
    name: String,
    level: { type: String, enum: ['débutant', 'intermédiaire', 'expert'] }
  }],

  // Formations
  enrolledCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
    completed: { type: Boolean, default: false },
    completedAt: Date,
    certificateId: String
  }],

  // Certifications obtenues
  certifications: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    certificateNumber: String,
    issuedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true }
  }],

  // Freelance
  freelanceProfile: {
    isFreelancer: { type: Boolean, default: false },
    title: String, // Ex: "Développeur Full Stack"
    hourlyRate: Number,
    portfolio: [{ title: String, url: String, image: String }],
    completedProjects: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 }
  },

  // Sécurité
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // RGPD
  dataConsent: { type: Boolean, default: false },
  marketingConsent: { type: Boolean, default: false },
  consentDate: Date,

  // Statut
  isActive: { type: Boolean, default: true },
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.city': 1 });
UserSchema.index({ 'freelanceProfile.isFreelancer': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual: Nom complet
UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Hash password avant sauvegarde
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Vérifier mot de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Générer JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Générer token de vérification email
UserSchema.methods.getEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
  
  return token;
};

// Générer token reset password
UserSchema.methods.getResetPasswordToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1h
  
  return token;
};

// Vérifier si compte bloqué
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Incrémenter tentatives de connexion
UserSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2h
  }
  
  await this.updateOne(updates);
};

module.exports = mongoose.model('User', UserSchema);
