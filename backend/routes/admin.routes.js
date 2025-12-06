const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Payment = require('../models/Payment.model');
const Project = require('../models/Project.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(protect);
router.use(authorize('admin'));

// @desc    Dashboard admin - statistiques globales
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Compteurs globaux
    const [totalUsers, totalCourses, totalProjects] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Course.countDocuments({ status: 'published' }),
      Project.countDocuments()
    ]);

    // Nouveaux utilisateurs ce mois
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
    });

    // Revenus
    const revenueThisMonth = await Payment.aggregate([
      { $match: { status: 'succeeded', paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueLastMonth = await Payment.aggregate([
      { $match: { status: 'succeeded', paidAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Inscriptions aux cours ce mois
    const enrollmentsThisMonth = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.enrolledAt': { $gte: startOfMonth } } },
      { $count: 'total' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalProjects,
          totalRevenue: revenueThisMonth[0]?.total || 0
        },
        thisMonth: {
          newUsers: newUsersThisMonth,
          revenue: revenueThisMonth[0]?.total || 0,
          enrollments: enrollmentsThisMonth[0]?.total || 0
        },
        growth: {
          users: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1) : 100,
          revenue: (revenueLastMonth[0]?.total || 0) > 0
            ? (((revenueThisMonth[0]?.total || 0) - (revenueLastMonth[0]?.total || 0)) / (revenueLastMonth[0]?.total || 1) * 100).toFixed(1)
            : 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Liste des utilisateurs
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Modifier le rôle d'un utilisateur
// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Rôle invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Bloquer/Débloquer un utilisateur
// @route   PUT /api/admin/users/:id/toggle-status
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive ? 'Utilisateur activé' : 'Utilisateur bloqué',
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Liste des cours (admin)
// @route   GET /api/admin/courses
router.get('/courses', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const courses = await Course.find(query)
      .populate('instructor', 'profile.firstName profile.lastName email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Approuver/Rejeter un cours
// @route   PUT /api/admin/courses/:id/review
router.put('/courses/:id/review', async (req, res) => {
  try {
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action invalide' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: 'Cours non trouvé' });

    if (action === 'approve') {
      course.status = 'published';
      course.publishedAt = new Date();
    } else {
      course.status = 'draft';
      // Envoyer notification au formateur avec la raison
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Cours publié' : 'Cours rejeté',
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Statistiques des revenus
// @route   GET /api/admin/revenue
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12));
    const end = endDate ? new Date(endDate) : new Date();

    const revenueStats = await Payment.getRevenueStats(start, end);
    const topCourses = await Payment.getTopCourses(10);

    res.status(200).json({
      success: true,
      data: { revenueStats, topCourses }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Liste des paiements
// @route   GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const payments = await Payment.find(query)
      .populate('user', 'profile.firstName profile.lastName email')
      .populate('course', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
