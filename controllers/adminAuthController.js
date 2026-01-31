const Admin = require("../models/Admin");
const { AppError } = require("../middleware/errorHandler");

// @desc    Register new admin
// @route   POST /api/auth/admin/register
// @access  Private/SuperAdmin (or Public for initial setup)
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return next(new AppError("Admin already exists with this email", 400));
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
    });

    // Generate token
    const token = admin.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          isActive: admin.isActive,
          isSuperAdmin: admin.isSuperAdmin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return next(new AppError("Invalid admin credentials", 401));
    }

    // Check if admin is active
    if (!admin.isActive) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        )
      );
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid admin credentials", 401));
    }

    // Generate token
    const token = admin.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          isActive: admin.isActive,
          isSuperAdmin: admin.isSuperAdmin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/admin/me
// @access  Private/Admin
exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};
