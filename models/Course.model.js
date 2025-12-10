const mongoose = require('mongoose');
const slugify = require('slugify');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  videoDuration: Number, // en secondes
  resources: [{
    title: String,
    type: { type: String, enum: ['pdf', 'link', 'file'] },
    url: String
  }],
  order: { type: Number, required: true },
  isFree: { type: Boolean, default: false }
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lessons: [LessonSchema],
  order: { type: Number, required: true }
});

const CourseSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Titre requis'],
    maxlength: [100, 'Maximum 100 caractères'],
    trim: true
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Description requise'],
    maxlength: [2000, 'Maximum 2000 caractères']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },

  // Catégorisation
  category: {
    type: String,
    required: true,
    enum: [
      'developpement-web',
      'developpement-mobile',
      'design',
      'marketing-digital',
      'data-science',
      'business',
      'langues',
      'soft-skills',
      'autre'
    ]
  },
  subcategory: String,
  tags: [String],

  // Média
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  previewVideo: String,

  // Instructeur
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenu
  chapters: [ChapterSchema],

  // Prix
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'MAD'
  },
  discount: {
    percentage: { type: Number, min: 0, max: 100 },
    validUntil: Date
  },

  // Statistiques
  stats: {
    studentsCount: { type: Number, default: 0 },
    lessonsCount: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // en minutes
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 }
  },

  // Niveau
  level: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance', 'expert'],
    default: 'debutant'
  },

  // Prérequis
  prerequisites: [String],

  // Ce que l'étudiant apprendra
  learningOutcomes: [String],

  // Langue
  language: {
    type: String,
    enum: ['fr', 'ar', 'en', 'darija'],
    default: 'fr'
  },

  // Certification
  hasCertificate: { type: Boolean, default: true },
  certificateTemplate: String,

  // Statut
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,

  // Featured
  isFeatured: { type: Boolean, default: false },
  featuredOrder: Number,

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
CourseSchema.index({ slug: 1 });
CourseSchema.index({ category: 1, status: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ 'stats.rating': -1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Générer slug avant sauvegarde
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Calculer stats avant sauvegarde
CourseSchema.pre('save', function(next) {
  let lessonsCount = 0;
  let totalDuration = 0;

  this.chapters.forEach(chapter => {
    lessonsCount += chapter.lessons.length;
    chapter.lessons.forEach(lesson => {
      totalDuration += lesson.videoDuration || 0;
    });
  });

  this.stats.lessonsCount = lessonsCount;
  this.stats.totalDuration = Math.round(totalDuration / 60); // convertir en minutes
  
  next();
});

// Virtual: Prix avec réduction
CourseSchema.virtual('discountedPrice').get(function() {
  if (this.discount?.percentage && this.discount?.validUntil > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Virtual: Est gratuit
CourseSchema.virtual('isFree').get(function() {
  return this.price === 0;
});

// Virtual: Durée formatée
CourseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.stats.totalDuration / 60);
  const minutes = this.stats.totalDuration % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
});

// Méthode statique: Recherche
CourseSchema.statics.search = async function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    $text: { $search: query }
  };

  if (filters.category) searchQuery.category = filters.category;
  if (filters.level) searchQuery.level = filters.level;
  if (filters.minPrice !== undefined) searchQuery.price = { $gte: filters.minPrice };
  if (filters.maxPrice !== undefined) {
    searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
  }

  return this.find(searchQuery)
    .select('-chapters')
    .populate('instructor', 'profile.firstName profile.lastName profile.avatar')
    .sort({ score: { $meta: 'textScore' } })
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('Course', CourseSchema);
