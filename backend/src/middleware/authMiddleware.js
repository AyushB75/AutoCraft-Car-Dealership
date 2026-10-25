import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (!/^[a-f\d]{24}$/i.test(decoded.id) || !['user', 'admin'].includes(decoded.role)) {
      return res.status(401).json({ message: 'Invalid token identity.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid, malformed, or expired token.' });
  }
};
