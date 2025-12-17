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
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://skillupmaroc.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
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

// === MIDDLEWARES ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// === ROUTES ===
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SkillUp Maroc API 🚀', environment: process.env.NODE_ENV });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/freelance', require('./routes/freelance.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/instructor', require('./routes/instructor.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/progress', require('./routes/progress.routes'));

// === ERREURS ===
app.use((req, res) => res.status(404).json({ success: false, error: 'Route non trouvée' }));

app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Erreur serveur' });
});

// === DÉMARRAGE ===
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🎓 SkillUp Maroc API sur port ${PORT}`);
});

module.exports = app;
