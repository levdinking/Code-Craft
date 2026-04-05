const express = require('express');
const cors = require('cors');
const path = require('path');
const { reloadEnv, getEnv } = require('./lib/env');

// Load env on startup
reloadEnv();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow localhost in dev and the production domain
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'https://my.delimes.ru'];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// Routes
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const articlesRoutes = require('./routes/articles');
const socialRoutes = require('./routes/social');
const pipelineRoutes = require('./routes/pipeline');
const publicationsRoutes = require('./routes/publications');
const settingsRoutes = require('./routes/settings');
const bufferRoutes = require('./routes/buffer');
const mediaRoutes = require('./routes/media');
const { authMiddleware } = require('./middleware/auth');

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/articles', authMiddleware, articlesRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/pipeline', authMiddleware, pipelineRoutes);
app.use('/api/publications', authMiddleware, publicationsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/buffer', authMiddleware, bufferRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = parseInt(getEnv('ADMIN_PORT', '3001'), 10);
app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
