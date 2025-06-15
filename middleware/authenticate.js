const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await db.promise().query(
      'SELECT user_id, email, role FROM users WHERE user_id = ?',
      [decoded.user_id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: users[0].user_id,
      email: users[0].email,
      role: users[0].role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
};

module.exports = authenticate;