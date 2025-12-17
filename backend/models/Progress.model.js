const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: String }],
  lastChapterIndex: { type: Number, default: 0 },
  lastLessonIndex: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
