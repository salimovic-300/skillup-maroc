require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: [
    "https://skillup-maroc-front-oi5xnuwtm-elghazouisalim30-9554s-projects.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillUp Maroc API 🚀' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/freelance', require('./routes/freelance.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/instructor', require('./routes/instructor.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/users', require('./routes/users.routes'));

app.use((req, res) => res.status(404).json({ success: false, error: 'Route non trouvée' }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🎓 API sur port ${PORT}`));
