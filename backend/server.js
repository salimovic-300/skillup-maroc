require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 1 : Connexion à MongoDB
// ═══════════════════════════════════════════════════════════════════
connectDB();

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 2 : Configuration CORS (DOIT ÊTRE EN PREMIER)
// ═══════════════════════════════════════════════════════════════════
// CORS = Cross-Origin Resource Sharing
// Permet à ton frontend (Vercel) de communiquer avec ton backend (Railway)
// Sans ça, le navigateur bloque les requêtes pour des raisons de sécurité

const corsOptions = {
  // Liste des domaines autorisés à faire des requêtes
  origin: [
    'http://localhost:3000',                      // Dev React classique
    'http://localhost:5173',                      // Dev Vite
    'https://skillup-maroc-front.vercel.app'      // Production Vercel
  ],
  
  // Autorise l'envoi de cookies et headers d'authentification
  credentials: true,
  
  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Headers autorisés dans les requêtes
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Active CORS avec les options définies
app.use(cors(corsOptions));

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 3 : Gestion des requêtes Preflight (OPTIONS)
// ═══════════════════════════════════════════════════════════════════
// Avant chaque requête POST/PUT/DELETE, le navigateur envoie d'abord
// une requête OPTIONS pour vérifier si le serveur accepte la requête
// Cette ligne répond "OK" à toutes ces vérifications

app.options('*', cors(corsOptions));

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 4 : Helmet (Sécurité) - APRÈS CORS
// ═══════════════════════════════════════════════════════════════════
// Helmet ajoute des headers de sécurité pour protéger ton API
// IMPORTANT : Doit être APRÈS cors() sinon il peut bloquer les requêtes

app.use(helmet({
  // Permet le chargement de ressources depuis d'autres domaines
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 5 : Middlewares de parsing
// ═══════════════════════════════════════════════════════════════════
// Permet de lire le JSON envoyé dans les requêtes (req.body)
app.use(express.json({ limit: '10mb' }));

// Permet de lire les cookies
app.use(cookieParser());

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 6 : Route de test (Health Check)
// ═══════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillUp Maroc API 🎓' });
});

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 7 : Routes de l'API
// ═══════════════════════════════════════════════════════════════════
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/freelance', require('./routes/freelance.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/instructor', require('./routes/instructor.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/users', require('./routes/users.routes'));

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 8 : Gestion des routes non trouvées
// ═══════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route non trouvée' });
});

// ═══════════════════════════════════════════════════════════════════
// ÉTAPE 9 : Démarrage du serveur
// ═══════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🎓 SkillUp Maroc API sur port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});