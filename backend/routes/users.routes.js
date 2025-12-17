const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Enrollment = require('../models/Enrollment.model');
const { protect } = require('../middleware/auth.middleware');

router.get('/enrolled-courses', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id, status: 'active' })
      .populate({ path: 'course', select: 'title slug description thumbnail chapters stats category level' })
      .sort('-createdAt');
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const enrollmentsCount = await Enrollment.countDocuments({ user: req.user.id, status: 'active' });
    res.status(200).json({ success: true, data: { ...user.toObject(), enrollmentsCount } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, city, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, {
      'profile.firstName': firstName, 'profile.lastName': lastName,
      'profile.phone': phone, 'profile.city': city, 'profile.bio': bio
    }, { new: true }).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/is-enrolled/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId, status: 'active' });
    res.status(200).json({ success: true, isEnrolled: !!enrollment, enrollment: enrollment || null });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
