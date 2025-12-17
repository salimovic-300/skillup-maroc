const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress.model');
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id, status: 'active' });
    if (!enrollment) return res.status(403).json({ success: false, error: 'Vous devez acheter ce cours' });
    
    let progress = await Progress.findOne({ user: req.user.id, course: course._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user.id, course: course._id, completedLessons: [], lastChapterIndex: 0, lastLessonIndex: 0 });
    }
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/:slug', async (req, res) => {
  try {
    const { lastChapterIndex, lastLessonIndex } = req.body;
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    
    const progress = await Progress.findOneAndUpdate(
      { user: req.user.id, course: course._id },
      { lastChapterIndex, lastLessonIndex, lastAccessedAt: new Date() },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/:slug/complete-lesson', async (req, res) => {
  try {
    const { lessonId, chapterIndex, lessonIndex } = req.body;
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    
    const progress = await Progress.findOneAndUpdate(
      { user: req.user.id, course: course._id },
      { $addToSet: { completedLessons: lessonId }, lastChapterIndex: chapterIndex, lastLessonIndex: lessonIndex, lastAccessedAt: new Date() },
      { new: true, upsert: true }
    );
    
    const totalLessons = course.chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
    const percentage = totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;
    await Enrollment.findOneAndUpdate({ user: req.user.id, course: course._id }, { progress: percentage });
    
    res.status(200).json({ success: true, data: progress, percentage });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
