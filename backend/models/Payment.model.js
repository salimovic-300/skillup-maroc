const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const PaymentSchema = new mongoose.Schema({
  // Utilisateur
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Cours acheté
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  // Montant
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'MAD'
  },

  // Réduction appliquée
  discount: {
    code: String,
    percentage: Number,
    amountSaved: Number
  },

  // Stripe
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money'],
    default: 'card'
  },

  // Informations carte (encryptées)
  cardInfo: {
    last4: String, // Derniers 4 chiffres
    brand: String, // visa, mastercard, etc.
    expMonth: Number,
    expYear: Number
  },

  // Statut
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },

  // Facture
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  },

  // Remboursement
  refund: {
    amount: Number,
    reason: String,
    stripeRefundId: String,
    refundedAt: Date
  },

  // Métadonnées
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' }
  },

  // Dates
  paidAt: Date,
  failedAt: Date

}, {
  timestamps: true
});

// Index
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ 'invoice.number': 1 });

// Générer numéro de facture unique
PaymentSchema.pre('save', async function(next) {
  if (!this.invoice?.number && this.status === 'succeeded') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Compter les factures du mois
    const count = await this.constructor.countDocuments({
      'invoice.number': { $regex: `^SKM-${year}${month}` }
    });
    
    this.invoice = {
      number: `SKM-${year}${month}-${String(count + 1).padStart(5, '0')}`,
      generatedAt: new Date()
    };
  }
  next();
});

// Méthode: Générer résumé sécurisé (sans données sensibles)
PaymentSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    paymentMethod: this.paymentMethod,
    cardInfo: this.cardInfo ? {
      last4: this.cardInfo.last4,
      brand: this.cardInfo.brand
    } : null,
    invoice: this.invoice,
    paidAt: this.paidAt,
    createdAt: this.createdAt
  };
};

// Statique: Statistiques revenus
PaymentSchema.statics.getRevenueStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'succeeded',
        paidAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' }
        },
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

// Statique: Top cours par revenus
PaymentSchema.statics.getTopCourses = async function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'succeeded' } },
    {
      $group: {
        _id: '$course',
        totalRevenue: { $sum: '$amount' },
        salesCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $project: {
        courseId: '$_id',
        title: '$course.title',
        thumbnail: '$course.thumbnail',
        totalRevenue: 1,
        salesCount: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', PaymentSchema);
