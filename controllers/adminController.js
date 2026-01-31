const Taxi = require("../models/Taxi");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

// ==================== TAXI MANAGEMENT ====================

// @desc    Add new taxi
// @route   POST /api/admin/taxis
// @access  Private/Admin
exports.addTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.create(req.body);

    res.status(201).json({
      success: true,
      message: "Taxi added successfully",
      data: taxi,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update taxi
// @route   PUT /api/admin/taxis/:id
// @access  Private/Admin
exports.updateTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!taxi) {
      return next(new AppError("Taxi not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Taxi updated successfully",
      data: taxi,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete taxi
// @route   DELETE /api/admin/taxis/:id
// @access  Private/Admin
exports.deleteTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.findById(req.params.id);

    if (!taxi) {
      return next(new AppError("Taxi not found", 404));
    }

    // Check if taxi has active bookings
    const activeBookings = await Booking.find({
      taxi: req.params.id,
      rideDate: { $gte: new Date() },
      bookingStatus: "confirmed",
    });

    if (activeBookings.length > 0) {
      return next(new AppError("Cannot delete taxi with active bookings", 400));
    }

    await taxi.deleteOne();

    res.status(200).json({
      success: true,
      message: "Taxi deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all taxis
// @route   GET /api/admin/taxis
// @access  Private/Admin
exports.getAllTaxis = async (req, res, next) => {
  try {
    const taxis = await Taxi.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: taxis.length,
      data: taxis,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ROUTE MANAGEMENT ====================

// @desc    Add new route
// @route   POST /api/admin/routes
// @access  Private/Admin
exports.addRoute = async (req, res, next) => {
  try {
    // Verify taxi exists
    const taxi = await Taxi.findById(req.body.taxi);
    if (!taxi) {
      return next(new AppError("Taxi not found", 404));
    }

    const route = await Route.create(req.body);
    await route.populate("taxi");

    res.status(201).json({
      success: true,
      message: "Route added successfully",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/admin/routes/:id
// @access  Private/Admin
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("taxi");

    if (!route) {
      return next(new AppError("Route not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/admin/routes/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return next(new AppError("Route not found", 404));
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
      route: req.params.id,
      rideDate: { $gte: new Date() },
      bookingStatus: "confirmed",
    });

    if (activeBookings.length > 0) {
      return next(
        new AppError("Cannot delete route with active bookings", 400)
      );
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all routes
// @route   GET /api/admin/routes
// @access  Private/Admin
exports.getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find().populate("taxi").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};


// ==================== BOOKING MANAGEMENT ====================

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date, taxiId } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (date) {
      query.rideDate = {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      };
    }

    if (taxiId) {
      query.taxi = taxiId;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("taxi")
      .populate("route")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({
      bookingStatus: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      bookingStatus: "cancelled",
    });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalTaxis = await Taxi.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
        },
        revenue: totalRevenue[0]?.total || 0,
        taxis: totalTaxis,
        routes: totalRoutes,
        users: totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
