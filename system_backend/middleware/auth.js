// authMiddleware.js

import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('token');

  // Check if no token
  if (!token) {
    console.log('No authentication token provided');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Add user ID from payload to request
    req.body.userId = decoded.id;
    console.log(`Authenticated request for user ID: ${decoded.id}`);
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default authMiddleware;




