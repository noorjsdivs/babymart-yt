import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

/**
 * Protect routes - require authentication
 * @desc Verifies JWT token and attaches user to request object
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token with JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_fallback');

      // Get user from database (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user account is active
      if (!req.user.isActive) {
        res.status(401);
        throw new Error('User account is deactivated');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired, please login again');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.message.includes('User not found')) {
        throw new Error('User account no longer exists');
      } else {
        throw new Error('Not authorized');
      }
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

/**
 * Optional authentication
 * @desc Tries to authenticate but doesn't require it
 */
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_fallback');
      const user = await User.findById(decoded.id).select('-password');
      
      // Only set req.user if user exists and is active
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional protection
      console.log('Optional auth failed:', error.message);
    }
  }
  
  next();
});

/**
 * Admin role check middleware
 * @desc Requires user to have admin role
 */
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

/**
 * Resource authorization middleware
 * @param {string} resourceUserIdField - Field name containing resource owner's user ID
 * @returns Middleware function
 */
const authorizeResource = (resourceUserIdField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    // Get resource user ID from request params or body
    let resourceUserId;
    
    if (req.params[resourceUserIdField]) {
      resourceUserId = req.params[resourceUserIdField];
    } else if (req.body[resourceUserIdField]) {
      resourceUserId = req.body[resourceUserIdField];
    } else {
      res.status(400);
      throw new Error(`Resource user ID not found in field: ${resourceUserIdField}`);
    }

    // Admin users can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    res.status(403);
    throw new Error('Not authorized to access this resource');
  });
};

/**
 * Specific user or admin authorization
 * @desc Allows user to access their own data or admin to access any data
 */
const authorizeUserOrAdmin = asyncHandler(async (req, res, next) => {
  const requestedUserId = req.params.id || req.body.userId;
  
  if (!requestedUserId) {
    res.status(400);
    throw new Error('User ID required');
  }

  // Admin can access any user
  if (req.user.role === 'admin') {
    return next();
  }

  // Users can only access their own data
  if (req.user._id.toString() === requestedUserId.toString()) {
    return next();
  }

  res.status(403);
  throw new Error('Not authorized to access this user data');
});

/**
 * Multi-role authorization
 * @param {...string} roles - Roles that are allowed
 * @returns Middleware function
 */
const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Not authorized. Required roles: ${roles.join(', ')}`);
    }

    next();
  });
};

// For backward compatibility
const isAdmin = admin;

export { 
  protect, 
  optionalProtect, 
  admin, 
  isAdmin, 
  authorizeResource, 
  authorizeUserOrAdmin,
  authorizeRoles 
};