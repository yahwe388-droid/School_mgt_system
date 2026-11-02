export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

const extractClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * General endpoint rate limiter with instance-isolated memory map and automatic garbage collection
 */
export const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 2000 }) => {
  // Closure-isolated in-memory map for this specific limiter instance
  const instanceMap = new Map();

  // Automatic periodic garbage collection of expired IP records to prevent memory leaks
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ipKey, rec] of instanceMap.entries()) {
      if (now > rec.resetTime) {
        instanceMap.delete(ipKey);
      }
    }
  }, 2 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    // Never rate limit CORS preflight requests
    if (req.method === 'OPTIONS') return next();

    const ip = extractClientIp(req);
    const now = Date.now();

    // Capacity safeguard against memory exhaustion attacks
    if (instanceMap.size > 20000) {
      for (const [k, v] of instanceMap.entries()) {
        if (now > v.resetTime) instanceMap.delete(k);
      }
    }

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

  // Periodic eviction of expired failed login tracking to conserve heap
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ipKey, rec] of failureMap.entries()) {
      if (now > rec.resetTime) {
        failureMap.delete(ipKey);
      }
    }
  }, 2 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    const ip = extractClientIp(req);
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

