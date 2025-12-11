require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// Connexion MongoDB
connectDB();

// === SÉCURITÉ ===
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Trop de requêtes, réessayez dans 15 minutes' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives, réessayez dans 1 heure' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// === MIDDLEWARES ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// === ROUTES ===
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SkillUp Maroc API 🚀', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/freelance', require('./routes/freelance.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// === ERREURS ===
app.use((req, res) => res.status(404).json({ success: false, error: `Route ${req.originalUrl} non trouvée` }));

app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: 'Erreur de validation', details: Object.values(err.errors).map(e => e.message) });
  }
  if (err.code === 11000) return res.status(400).json({ success: false, error: `${Object.keys(err.keyValue)[0]} déjà utilisé` });
  if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'ID invalide' });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, error: 'Token invalide' });
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Erreur serveur' });
});

// === DÉMARRAGE ===
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`\n🎓 SkillUp Maroc API\n   Mode: ${process.env.NODE_ENV || 'development'}\n   Port: ${PORT}\n   URL:  http://localhost:${PORT}\n`);
});

process.on('unhandledRejection', (err) => { console.error('❌ Unhandled Rejection:', err.message); server.close(() => process.exit(1)); });
process.on('SIGTERM', () => { console.log('👋 Fermeture gracieuse...'); server.close(() => process.exit(0)); });

module.exports = app;
