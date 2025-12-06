const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['profile.firstName', 'profile.lastName', 'profile.bio', 'profile.phone', 'profile.city'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) || key.startsWith('profile.')) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir mes cours
// @route   GET /api/users/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title slug thumbnail stats.totalDuration stats.lessonsCount instructor',
        populate: { path: 'instructor', select: 'profile.firstName profile.lastName' }
      });

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Mettre à jour la progression d'un cours
// @route   PUT /api/users/courses/:courseId/progress
// @access  Private
router.put('/courses/:courseId/progress', protect, async (req, res) => {
  try {
    const { lessonId, completed } = req.body;

    const user = await User.findById(req.user.id);
    const enrollment = user.enrolledCourses.find(e => e.course.toString() === req.params.courseId);

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Inscription non trouvée' });
    }

    // Ajouter ou retirer la leçon des complétées
    if (completed && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    } else if (!completed) {
      enrollment.completedLessons = enrollment.completedLessons.filter(l => l.toString() !== lessonId);
    }

    // Calculer la progression
    const course = await Course.findById(req.params.courseId);
    const totalLessons = course.stats.lessonsCount;
    enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

    // Marquer comme complété si 100%
    if (enrollment.progress >= 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      // Générer certificat
      enrollment.certificateId = `CERT-${Date.now()}-${user._id.toString().slice(-6)}`;
      
      // Ajouter aux certifications
      user.certifications.push({
        courseId: course._id,
        certificateNumber: enrollment.certificateId,
        issuedAt: new Date()
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        completed: enrollment.completed,
        certificateId: enrollment.certificateId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir mes certifications
// @route   GET /api/users/certifications
// @access  Private
router.get('/certifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'certifications.courseId', select: 'title slug thumbnail' });

    res.status(200).json({
      success: true,
      count: user.certifications.length,
      data: user.certifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Supprimer mon compte (RGPD)
// @route   DELETE /api/users/me
// @access  Private
router.delete('/me', protect, async (req, res) => {
  try {
    // Soft delete - anonymiser les données
    await User.findByIdAndUpdate(req.user.id, {
      email: `deleted_${req.user.id}@skillupmaroc.ma`,
      profile: { firstName: 'Utilisateur', lastName: 'Supprimé' },
      isActive: false,
      deletedAt: new Date()
    });

    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Compte supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Exporter mes données (RGPD)
// @route   GET /api/users/export-data
// @access  Private
router.get('/export-data', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.course', 'title')
      .populate('certifications.courseId', 'title');

    const exportData = {
      profile: user.profile,
      email: user.email,
      enrolledCourses: user.enrolledCourses,
      certifications: user.certifications,
      skills: user.skills,
      freelanceProfile: user.freelanceProfile,
      createdAt: user.createdAt,
      exportedAt: new Date()
    };

    res.status(200).json({ success: true, data: exportData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const stats = {
      coursesInProgress: user.enrolledCourses.filter(e => !e.completed).length,
      coursesCompleted: user.enrolledCourses.filter(e => e.completed).length,
      certificationsCount: user.certifications.length,
      averageProgress: user.enrolledCourses.length > 0
        ? Math.round(user.enrolledCourses.reduce((sum, e) => sum + e.progress, 0) / user.enrolledCourses.length)
        : 0
    };

    // Si freelancer
    if (user.freelanceProfile?.isFreelancer) {
      const Project = require('../models/Project.model');
      const completedProjects = await Project.countDocuments({
        selectedFreelancer: user._id,
        status: 'completed'
      });
      stats.freelance = {
        completedProjects,
        rating: user.freelanceProfile.rating,
        reviewsCount: user.freelanceProfile.reviewsCount
      };
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
