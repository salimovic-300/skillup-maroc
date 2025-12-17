const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const { protect, isAdmin } = require('../middleware/auth.middleware');

router.use(protect);
router.use(isAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$pricePaid' } } }
      ])
    ]);
    res.status(200).json({ success: true, data: { totalUsers, totalCourses, totalEnrollments, totalRevenue: revenueAgg[0]?.total || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt').limit(100);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Impossible de supprimer un admin' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'profile.firstName profile.lastName email').sort('-createdAt').limit(100);
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/courses/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id });
    res.status(200).json({ success: true, message: 'Cours supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
