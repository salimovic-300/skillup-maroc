const express = require('express');
const router = express.Router();
const Course = require('../models/Course.model');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

// @desc    Obtenir tous les cours (publics)
// @route   GET /api/courses
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      level,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Construction de la query
    const query = { status: 'published' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const courses = await Course.find(query)
      .select('-chapters.lessons.videoUrl') // Ne pas exposer les URLs vidéo
      .populate('instructor', 'profile.firstName profile.lastName profile.avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: courses
    });

  } catch (error) {
    console.error('Erreur get courses:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir les cours featured
// @route   GET /api/courses/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const courses = await Course.find({ 
      status: 'published', 
      isFeatured: true 
    })
    .select('-chapters')
    .populate('instructor', 'profile.firstName profile.lastName profile.avatar')
    .sort('featuredOrder')
    .limit(6);

    res.status(200).json({ success: true, data: courses });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir un cours par slug
// @route   GET /api/courses/:slug
// @access  Public (contenu limité) / Private (contenu complet si inscrit)
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ 
      slug: req.params.slug,
      status: 'published'
    }).populate('instructor', 'profile.firstName profile.lastName profile.avatar profile.bio');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cours non trouvé' 
      });
    }

    // Vérifier si l'utilisateur est inscrit
    let isEnrolled = false;
    let userProgress = null;

    if (req.user) {
      const enrollment = req.user.enrolledCourses.find(
        e => e.course.toString() === course._id.toString()
      );
      if (enrollment) {
        isEnrolled = true;
        userProgress = {
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          completed: enrollment.completed
        };
      }
    }

    // Masquer les URLs des vidéos si non inscrit
    const courseData = course.toObject();
    if (!isEnrolled) {
      courseData.chapters = courseData.chapters.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.map(lesson => ({
          ...lesson,
          videoUrl: lesson.isFree ? lesson.videoUrl : null
        }))
      }));
    }

    res.status(200).json({
      success: true,
      data: courseData,
      isEnrolled,
      userProgress
    });

  } catch (error) {
    console.error('Erreur get course:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Créer un cours (instructeur)
// @route   POST /api/courses
// @access  Private (instructor, admin)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    req.body.instructor = req.user.id;
    
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Erreur create course:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Mettre à jour un cours
// @route   PUT /api/courses/:id
// @access  Private (owner, admin)
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    }

    // Vérifier ownership
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Non autorisé' 
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: course });

  } catch (error) {
    console.error('Erreur update course:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Supprimer un cours
// @route   DELETE /api/courses/:id
// @access  Private (owner, admin)
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    }

    // Vérifier ownership
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Non autorisé' });
    }

    // Soft delete - archiver plutôt que supprimer
    course.status = 'archived';
    await course.save();

    res.status(200).json({ 
      success: true, 
      message: 'Cours archivé' 
    });

  } catch (error) {
    console.error('Erreur delete course:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir les catégories avec comptage
// @route   GET /api/courses/categories/stats
// @access  Public
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await Course.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$stats.rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
