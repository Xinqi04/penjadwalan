const API_KEY = process.env.API_KEY || 'SECRET123';

/**
 * Middleware untuk validasi API Key dari header x-api-key
 */
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

module.exports = apiKeyMiddleware;
