// backend/routes/instructor.routes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course.model');
const { protect } = require('../middleware/auth.middleware');

// Middleware pour vérifier le rôle instructeur
const isInstructor = (req, res, next) => {
  // Pour l'instant, on permet à tous les utilisateurs authentifiés d'être instructeurs
  // Plus tard, on peut ajouter une vérification de rôle
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Non autorisé' });
  }
  next();
};

// @desc    Obtenir les cours de l'instructeur
// @route   GET /api/instructor/courses
// @access  Private
router.get('/courses', protect, isInstructor, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Erreur get instructor courses:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir un cours spécifique de l'instructeur
// @route   GET /api/instructor/courses/:id
// @access  Private
router.get('/courses/:id', protect, isInstructor, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user.id
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur get course:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Statistiques de l'instructeur
// @route   GET /api/instructor/stats
// @access  Private
router.get('/stats', protect, isInstructor, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    
    const stats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      totalStudents: courses.reduce((acc, c) => acc + (c.stats?.studentsCount || 0), 0),
      totalRevenue: courses.reduce((acc, c) => acc + ((c.stats?.studentsCount || 0) * (c.price || 0)), 0),
      avgRating: 0
    };

    const ratings = courses.filter(c => c.ratings?.average > 0).map(c => c.ratings.average);
    if (ratings.length > 0) {
      stats.avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur get stats:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
