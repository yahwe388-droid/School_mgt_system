import express from 'express';
import cors from 'cors';
import { securityHeaders, rateLimiter } from './middleware/securityMiddleware.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const serverStartTime = Date.now();

// Security & Logging Middleware
app.use(securityHeaders);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 150 })); // Rate Limit 150 req / 15 mins

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
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

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled API Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  logger.info(`Production Server running on http://localhost:${PORT}`);
});
