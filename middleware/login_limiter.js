const rateLimit = require('express-rate-limit');


const login_limiter = rateLimit({
  windowMs: 15,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  skipSuccessfulRequests: false,
  requestPropertyName: 'rateLimit',
});

module.exports = login_limiter;