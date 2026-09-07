require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:8081', // Expo web
      'exp://localhost:8081',   // Expo dev client
      'http://localhost:19006', // Expo web dev
    ],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'twinex-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TWINEX server running on http://localhost:${PORT}`);
  console.log(`   NODE_ENV=${process.env.NODE_ENV}`);
});