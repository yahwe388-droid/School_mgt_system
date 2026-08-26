export const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, Object.keys(meta).length ? meta : '');
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, Object.keys(meta).length ? meta : '');
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`, error.message || error);
  },

  audit: (action, userId, role, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, action, userId, role, details };
    console.log(`[AUDIT] [${timestamp}] User:${userId} (${role}) Action:${action}`, details);
    return logEntry;
  }
};
