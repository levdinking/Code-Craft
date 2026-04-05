const express = require('express');
const jwt = require('jsonwebtoken');
const { getEnv } = require('../lib/env');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = getEnv('ADMIN_PASSWORD');

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const secret = getEnv('JWT_SECRET');
  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '24h' });
  res.json({ token, expiresIn: '24h' });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  try {
    const secret = getEnv('JWT_SECRET');
    jwt.verify(authHeader.split(' ')[1], secret);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
