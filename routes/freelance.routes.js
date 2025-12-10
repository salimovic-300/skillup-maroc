const express = require('express');
const router = express.Router();
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// @desc    Obtenir tous les projets ouverts
// @route   GET /api/freelance/projects
router.get('/projects', optionalAuth, async (req, res) => {
  try {
    const { category, skills, budgetMin, budgetMax, experienceLevel, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;

    const query = { status: 'open', visibility: 'public' };
    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (skills) query.skills = { $in: skills.split(',') };
    if (budgetMin) query['budget.maxAmount'] = { $gte: Number(budgetMin) };
    if (budgetMax) query['budget.minAmount'] = { $lte: Number(budgetMax) };
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const projects = await Project.find(query)
      .populate('client', 'profile.firstName profile.lastName profile.avatar')
      .sort(sort).skip(skip).limit(Number(limit));

    const total = await Project.countDocuments(query);

    res.status(200).json({ success: true, count: projects.length, total, totalPages: Math.ceil(total / limit), currentPage: Number(page), data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Obtenir un projet par ID
// @route   GET /api/freelance/projects/:id
router.get('/projects/:id', optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'profile.firstName profile.lastName profile.avatar profile.city')
      .populate('selectedFreelancer', 'profile.firstName profile.lastName profile.avatar freelanceProfile');

    if (!project) return res.status(404).json({ success: false, error: 'Projet non trouvé' });

    await Project.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

    let hasApplied = false, userApplication = null;
    if (req.user) {
      const app = project.applications.find(a => a.freelancer.toString() === req.user.id);
      if (app) { hasApplied = true; userApplication = app; }
    }

    const projectData = project.toObject();
    if (!req.user || project.client._id.toString() !== req.user.id) projectData.applications = undefined;

    res.status(200).json({ success: true, data: projectData, hasApplied, userApplication });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Créer un projet
// @route   POST /api/freelance/projects
router.post('/projects', protect, async (req, res) => {
  try {
    req.body.client = req.user.id;
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Postuler à un projet
// @route   POST /api/freelance/projects/:id/apply
router.post('/projects/:id/apply', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    if (project.status !== 'open') return res.status(400).json({ success: false, error: 'Projet fermé aux candidatures' });
    if (project.client.toString() === req.user.id) return res.status(400).json({ success: false, error: 'Vous ne pouvez pas postuler à votre propre projet' });
    if (project.hasApplied(req.user.id)) return res.status(400).json({ success: false, error: 'Déjà postulé' });

    const { coverLetter, proposedBudget, proposedDuration } = req.body;
    if (!coverLetter) return res.status(400).json({ success: false, error: 'Lettre de motivation requise' });

    project.applications.push({ freelancer: req.user.id, coverLetter, proposedBudget, proposedDuration });
    await project.save();

    res.status(201).json({ success: true, message: 'Candidature envoyée' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Candidatures d'un projet (client only)
// @route   GET /api/freelance/projects/:id/applications
router.get('/projects/:id/applications', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({ path: 'applications.freelancer', select: 'profile freelanceProfile skills' });

    if (!project) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Non autorisé' });
    }

    res.status(200).json({ success: true, count: project.applications.length, data: project.applications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Accepter candidature
// @route   POST /api/freelance/projects/:id/applications/:appId/accept
router.post('/projects/:id/applications/:appId/accept', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Non autorisé' });

    await project.acceptApplication(req.params.appId);
    res.status(200).json({ success: true, message: 'Candidature acceptée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Mes projets (client)
// @route   GET /api/freelance/my-projects
router.get('/my-projects', protect, async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id })
      .populate('selectedFreelancer', 'profile.firstName profile.lastName profile.avatar')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Mes candidatures (freelancer)
// @route   GET /api/freelance/my-applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'applications.freelancer': req.user.id })
      .populate('client', 'profile.firstName profile.lastName profile.avatar').sort('-createdAt');

    const applications = projects.map(p => ({
      project: { _id: p._id, title: p.title, category: p.category, budget: p.budget, status: p.status, client: p.client },
      application: p.applications.find(a => a.freelancer.toString() === req.user.id)
    }));

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Mes missions en cours
// @route   GET /api/freelance/my-missions
router.get('/my-missions', protect, async (req, res) => {
  try {
    const missions = await Project.find({ selectedFreelancer: req.user.id, status: { $in: ['in_progress', 'completed'] } })
      .populate('client', 'profile.firstName profile.lastName profile.avatar').sort('-startDate');
    res.status(200).json({ success: true, count: missions.length, data: missions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Activer profil freelance
// @route   POST /api/freelance/activate-profile
router.post('/activate-profile', protect, async (req, res) => {
  try {
    const { title, hourlyRate, skills } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Titre requis' });

    await User.findByIdAndUpdate(req.user.id, {
      'freelanceProfile.isFreelancer': true,
      'freelanceProfile.title': title,
      'freelanceProfile.hourlyRate': hourlyRate,
      skills: skills?.map(s => ({ name: s.name, level: s.level || 'intermédiaire' }))
    });

    res.status(200).json({ success: true, message: 'Profil freelance activé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Projets recommandés
// @route   GET /api/freelance/recommended
router.get('/recommended', protect, async (req, res) => {
  try {
    const userSkills = req.user.skills?.map(s => s.name) || [];
    const projects = await Project.getRecommended(req.user.id, userSkills, 10);
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
