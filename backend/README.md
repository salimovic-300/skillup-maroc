# 🎓 SkillUp Maroc - Backend API

API REST complète pour la plateforme SkillUp Maroc (EdTech + Freelancing).

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
cd backend
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Lancer en développement
npm run dev
```

## 📁 Structure

```
backend/
├── server.js              # Point d'entrée
├── config/
│   └── db.js              # Connexion MongoDB
├── models/
│   ├── User.model.js      # Utilisateurs (auth, profil, inscriptions)
│   ├── Course.model.js    # Cours (chapitres, leçons, stats)
│   ├── Payment.model.js   # Paiements Stripe
│   └── Project.model.js   # Projets freelance
├── controllers/
│   └── auth.controller.js # Logique d'authentification
├── routes/
│   ├── auth.routes.js     # /api/auth/*
│   ├── user.routes.js     # /api/users/*
│   ├── course.routes.js   # /api/courses/*
│   ├── payment.routes.js  # /api/payments/*
│   ├── freelance.routes.js # /api/freelance/*
│   └── admin.routes.js    # /api/admin/*
├── middleware/
│   ├── auth.middleware.js # Protection JWT
│   └── validate.middleware.js
└── utils/
    └── email.util.js      # Templates emails
```

## 🔐 Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | Inscription |
| `/api/auth/login` | POST | Connexion |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/auth/me` | GET | Profil connecté |
| `/api/auth/verify-email/:token` | GET | Vérifier email |
| `/api/auth/forgot-password` | POST | Mot de passe oublié |
| `/api/auth/reset-password/:token` | PUT | Réinitialiser MDP |

## 📚 Cours

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/courses` | GET | - | Liste des cours |
| `/api/courses/featured` | GET | - | Cours en vedette |
| `/api/courses/:slug` | GET | - | Détail d'un cours |
| `/api/courses` | POST | Instructor | Créer un cours |
| `/api/courses/:id` | PUT | Owner | Modifier un cours |

## 💳 Paiements

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/payments/create-checkout-session` | POST | ✓ | Créer session Stripe |
| `/api/payments/webhook` | POST | - | Webhook Stripe |
| `/api/payments/my-payments` | GET | ✓ | Historique paiements |
| `/api/payments/:id/refund` | POST | ✓ | Demander remboursement |

## 💼 Freelance

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/freelance/projects` | GET | - | Liste projets |
| `/api/freelance/projects/:id` | GET | - | Détail projet |
| `/api/freelance/projects` | POST | ✓ | Créer projet |
| `/api/freelance/projects/:id/apply` | POST | ✓ | Postuler |
| `/api/freelance/my-projects` | GET | ✓ | Mes projets (client) |
| `/api/freelance/my-applications` | GET | ✓ | Mes candidatures |
| `/api/freelance/activate-profile` | POST | ✓ | Activer profil freelance |

## 🛡️ Sécurité

- ✅ JWT Authentication (HttpOnly cookies)
- ✅ Bcrypt (12 rounds) pour mots de passe
- ✅ Rate limiting (100 req/15min global, 10/h pour auth)
- ✅ Helmet.js (headers sécurité)
- ✅ CORS configuré
- ✅ Validation avec express-validator
- ✅ Protection CSRF
- ✅ Blocage compte après 5 tentatives

## 🔧 Variables d'Environnement

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/skillup-maroc

# JWT
JWT_SECRET=votre_secret_32_caracteres_minimum
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email
SMTP_PASS=votre_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📝 Modèles

### User
- Email/Password avec vérification
- Profil (nom, avatar, bio, ville)
- Cours inscrits avec progression
- Certifications
- Profil freelance optionnel
- RGPD: consentement, export, suppression

### Course
- Chapitres > Leçons (vidéo, ressources)
- Pricing avec réductions
- Stats (étudiants, rating, durée)
- Certificat automatique à 100%

### Payment
- Intégration Stripe complète
- Génération factures
- Remboursement (14 jours)

### Project
- Projets freelance avec candidatures
- Milestones et livrables
- Système de matching par compétences

## 🧪 Test de l'API

```bash
# Santé
curl http://localhost:5000/api/health

# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","firstName":"Test","lastName":"User","dataConsent":true}'

# Liste cours
curl http://localhost:5000/api/courses
```

## 📦 Déploiement

### Railway / Render
1. Connecter le repo GitHub
2. Configurer les variables d'environnement
3. Deploy automatique

### Variables de production
- `NODE_ENV=production`
- `MONGODB_URI` = MongoDB Atlas
- Configurer Stripe en mode live

---

**Construit avec ❤️ pour le Maroc 🇲🇦**
