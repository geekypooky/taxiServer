const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Protect routes - verify JWT token (for users)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return next(new AppError("User no longer exists", 401));
      }

      next();
    } catch (error) {
      return next(new AppError("Not authorized to access this route", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Protect admin routes - verify JWT token (for admins)
exports.protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is for admin
      if (decoded.type !== "admin") {
        return next(new AppError("Admin access required", 403));
      }

      // Get admin from token
      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return next(new AppError("Admin no longer exists", 401));
      }

      // Check if admin is active
      if (!req.admin.isActive) {
        return next(new AppError("Admin account is deactivated", 403));
      }

      next();
    } catch (error) {
      return next(new AppError("Not authorized to access this route", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// Admin only middleware (legacy - kept for backward compatibility)
exports.adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("Please authenticate first", 401));
    }

    if (req.user.role !== "admin") {
      return next(new AppError("Access denied. Admin only.", 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
