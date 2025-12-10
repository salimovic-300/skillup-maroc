const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  proposedBudget: Number,
  proposedDuration: Number, // en jours
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  appliedAt: { type: Date, default: Date.now }
});

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  dueDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'paid'],
    default: 'pending'
  },
  deliverables: [{
    title: String,
    url: String,
    uploadedAt: Date
  }],
  paidAt: Date
});

const ProjectSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Titre requis'],
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description requise'],
    maxlength: 5000
  },

  // Client (entreprise ou particulier)
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Catégorie
  category: {
    type: String,
    required: true,
    enum: [
      'developpement-web',
      'developpement-mobile',
      'design-graphique',
      'ui-ux',
      'marketing-digital',
      'redaction',
      'traduction',
      'video-animation',
      'data-analysis',
      'autre'
    ]
  },

  // Compétences requises
  skills: [{
    type: String,
    required: true
  }],

  // Budget
  budget: {
    type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    minAmount: Number,
    maxAmount: Number,
    currency: { type: String, default: 'MAD' }
  },

  // Durée estimée
  duration: {
    value: Number,
    unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' }
  },

  // Niveau d'expérience requis
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'intermediate'
  },

  // Localisation
  location: {
    type: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote' },
    city: String,
    country: { type: String, default: 'Maroc' }
  },

  // Candidatures
  applications: [ApplicationSchema],

  // Freelancer sélectionné
  selectedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Milestones (jalons)
  milestones: [MilestoneSchema],

  // Statut
  status: {
    type: String,
    enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'draft'
  },

  // Dates
  startDate: Date,
  endDate: Date,
  deadline: Date,

  // Fichiers attachés
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],

  // Évaluation finale
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    reviewedAt: Date
  },

  // Visibilité
  visibility: {
    type: String,
    enum: ['public', 'invite_only', 'private'],
    default: 'public'
  },

  // Stats
  stats: {
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ client: 1 });
ProjectSchema.index({ selectedFreelancer: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ skills: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

// Virtual: Budget formaté
ProjectSchema.virtual('budgetDisplay').get(function() {
  if (this.budget.type === 'fixed') {
    if (this.budget.minAmount === this.budget.maxAmount) {
      return `${this.budget.minAmount} ${this.budget.currency}`;
    }
    return `${this.budget.minAmount} - ${this.budget.maxAmount} ${this.budget.currency}`;
  }
  return `${this.budget.minAmount} - ${this.budget.maxAmount} ${this.budget.currency}/h`;
});

// Virtual: Montant total des milestones
ProjectSchema.virtual('totalMilestonesAmount').get(function() {
  return this.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
});

// Mettre à jour le compteur de candidatures
ProjectSchema.pre('save', function(next) {
  this.stats.applicationsCount = this.applications.length;
  next();
});

// Méthode: Vérifier si l'utilisateur a déjà postulé
ProjectSchema.methods.hasApplied = function(userId) {
  return this.applications.some(app => 
    app.freelancer.toString() === userId.toString()
  );
};

// Méthode: Accepter une candidature
ProjectSchema.methods.acceptApplication = async function(applicationId) {
  const application = this.applications.id(applicationId);
  if (!application) throw new Error('Candidature non trouvée');

  // Rejeter toutes les autres candidatures
  this.applications.forEach(app => {
    if (app._id.toString() !== applicationId.toString()) {
      app.status = 'rejected';
    }
  });

  application.status = 'accepted';
  this.selectedFreelancer = application.freelancer;
  this.status = 'in_progress';
  this.startDate = new Date();

  await this.save();
  return this;
};

// Statique: Projets recommandés pour un freelancer
ProjectSchema.statics.getRecommended = async function(userId, userSkills, limit = 10) {
  return this.find({
    status: 'open',
    'applications.freelancer': { $ne: userId },
    skills: { $in: userSkills }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('client', 'profile.firstName profile.lastName profile.avatar');
};

module.exports = mongoose.model('Project', ProjectSchema);
