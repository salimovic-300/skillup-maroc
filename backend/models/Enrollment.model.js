const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'expired', 'refunded'], default: 'active' },
  pricePaid: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['stripe', 'free', 'coupon', 'admin'], default: 'stripe' },
  stripePaymentId: { type: String },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
