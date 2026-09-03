export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * General endpoint rate limiter with instance-isolated memory map
 */
export const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 200 }) => {
  // Closure-isolated in-memory map for this specific limiter instance
  const instanceMap = new Map();

  return (req, res, next) => {
    // Never rate limit CORS preflight requests
    if (req.method === 'OPTIONS') return next();

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = instanceMap.get(ip) || { count: 0, resetTime: now + options.windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
    } else {
      record.count += 1;
    }

    instanceMap.set(ip, record);

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));

    if (record.count > options.max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Rate limit exceeded. Please try again later.',
        retryAfterSeconds: retryAfterSec
      });
    }

    next();
  };
};

/**
 * Dedicated failed-login rate limiter
 * Protects against brute-force attacks by only counting FAILED attempts
 * Normal successful logins never trigger 429
 */
export const authFailureRateLimiter = (options = { windowMs: 15 * 60 * 1000, maxFailures: 10 }) => {
  const failureMap = new Map();

  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = failureMap.get(ip) || { failures: 0, resetTime: now + options.windowMs };

    if (now > record.resetTime) {
      record.failures = 0;
      record.resetTime = now + options.windowMs;
      failureMap.set(ip, record);
    }

    // Check if client has already exceeded failed login threshold
    if (record.failures >= options.maxFailures) {
      const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        retryAfterSeconds: retryAfterSec
      });
    }

    // Intercept response to check if login succeeded or failed
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // If unauthorized or login rejected due to credentials
      if (res.statusCode === 401) {
        record.failures += 1;
        failureMap.set(ip, record);
      } else if (res.statusCode === 200 && body?.success) {
        // Clear failed attempts upon successful authentication
        failureMap.delete(ip);
      }
      return originalJson(body);
    };

    next();
  };
};

