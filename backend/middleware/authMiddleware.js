import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../modules/auth/auth.model.js';
import Employee from '../modules/employee/employee.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      req.user._id = decoded.id;

      // If it's a client user (not an employee/admin), check if they are blocked
      if (!req.user.role || req.user.role === 'client') {
        const user = await User.findById(req.user.id);
        if (user && user.isBlocked) {
          res.status(403);
          throw new Error('Your account has been blocked. Access denied.');
        }
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Allow access to admin OR specific employee roles
export const employeeOrAdmin = (...roles) => (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  if (req.user && req.user.role && roles.includes(req.user.role)) return next();
  res.status(403);
  throw new Error('Access denied: insufficient permissions');
};
