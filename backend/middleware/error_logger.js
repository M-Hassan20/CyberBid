const db = require('../db');

const error_logger = (err, req, res, next) => {
  const user_id = req.user ? req.user.id : null;
  const endpoint = req.originalUrl;
  const error_message = err.message || 'Unknown error';
  const stack_trace = err.stack || null;
  const ip_address = req.ip || req.connection.remoteAddress;
  const user_agent = req.headers['user-agent'] || null;

  try {
    const query = `
      INSERT INTO error_logs 
      (user_id, endpoint, error_message, stack_trace, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.promise().query(query, [
      user_id, 
      endpoint, 
      error_message, 
      stack_trace, 
      ip_address, 
      user_agent
    ]);
    
    next(err);
  } catch (logError) {
    console.error('Error while logging error:', logError);
    next(err);
  }
};

module.exports = error_logger;