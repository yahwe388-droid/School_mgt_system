import express from 'express';
import cors from 'cors';
import { securityHeaders, rateLimiter, authFailureRateLimiter } from './middleware/securityMiddleware.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { teacherRouter, studentRouter, parentRouter } from './routes/roleProtectedRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const serverStartTime = Date.now();

// Security & Logging Middleware
app.use(securityHeaders);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 })); // General Rate Limit 200 req / 15 mins

// Dedicated failed-login brute-force rate limiter (10 failed attempts per 15 mins)
const loginFailureLimiter = authFailureRateLimiter({ windowMs: 15 * 60 * 1000, maxFailures: 10 });

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth/login', loginFailureLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/parent', parentRouter);
app.use('/api/users', userRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/communication', communicationRoutes);

// Comprehensive Health & Monitoring Check Endpoint
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds,
    memoryUsageMB: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files when built (e.g. in production)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled API Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  logger.info(`Production Server running on http://localhost:${PORT}`);
});
