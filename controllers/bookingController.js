const Booking = require("../models/Booking");
const Taxi = require("../models/Taxi");
const Route = require("../models/Route");
const { AppError } = require("../middleware/errorHandler");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { taxiId, routeId, rideDate, passengerCount, passengerName, passengerPhone, pickupLocation, dropLocation } =
      req.body;

    // Validate required fields
    if (!taxiId || !routeId || !rideDate || !passengerCount || !passengerName || !passengerPhone) {
      return next(
        new AppError("Please provide all required booking details", 400)
      );
    }

    // Verify taxi and route exist
    const taxi = await Taxi.findById(taxiId);
    const route = await Route.findById(routeId);

    if (!taxi || !route) {
      return next(new AppError("Taxi or route not found", 404));
    }

    // Check if taxi is already booked for this route and date
    const existingBooking = await Booking.findOne({
      taxi: taxiId,
      route: routeId,
      rideDate: {
        $gte: new Date(rideDate).setHours(0, 0, 0, 0),
        $lte: new Date(rideDate).setHours(23, 59, 59, 999),
      },
      bookingStatus: "confirmed",
    });

    if (existingBooking) {
      return next(
        new AppError("This taxi is already booked for the selected date and route", 400)
      );
    }

    // Validate passenger count against taxi capacity
    if (passengerCount > taxi.capacity) {
      return next(
        new AppError(`This taxi can only accommodate ${taxi.capacity} passengers`, 400)
      );
    }

    // Calculate total amount
    const totalAmount = route.price;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      taxi: taxiId,
      route: routeId,
      rideDate,
      passengerCount,
      passengerName,
      passengerPhone,
      pickupLocation,
      dropLocation,
      totalAmount,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
    });

    // Populate booking details
    await booking.populate([
      { path: "user", select: "name email phone" },
      { path: "taxi" },
      { path: "route" },
    ]);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/:userId
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Ensure user can only access their own bookings (unless admin)
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return next(new AppError("Not authorized to access these bookings", 403));
    }

    const bookings = await Booking.find({ user: userId })
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("taxi")
      .populate("route");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Ensure user can only access their own booking (unless admin)
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to access this booking", 403));
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Ensure user can only cancel their own booking (unless admin)
    if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
      return next(new AppError("Not authorized to cancel this booking", 403));
    }

    // Check if already cancelled
    if (booking.bookingStatus === "cancelled") {
      return next(new AppError("Booking is already cancelled", 400));
    }

    // Check if ride date has passed
    if (new Date(booking.rideDate) < new Date()) {
      return next(new AppError("Cannot cancel past bookings", 400));
    }

    // Calculate refund (simple logic - can be enhanced)
    const journeyDate = new Date(booking.rideDate);
    const now = new Date();
    const hoursDifference = (journeyDate - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (hoursDifference >= 24) {
      refundPercentage = 90; // 90% refund if cancelled 24+ hours before
    } else if (hoursDifference >= 12) {
      refundPercentage = 50; // 50% refund if cancelled 12-24 hours before
    } else if (hoursDifference >= 6) {
      refundPercentage = 25; // 25% refund if cancelled 6-12 hours before
    }

    const refundAmount = (booking.totalAmount * refundPercentage) / 100;

    // Update booking
    booking.bookingStatus = "cancelled";
    booking.cancellationReason = req.body.reason || "User cancelled";
    booking.cancelledAt = Date.now();
    booking.refundAmount = refundAmount;
    booking.paymentStatus =
      refundAmount > 0 ? "refunded" : booking.paymentStatus;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
        refundAmount,
        refundPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment (placeholder)
// @route   POST /api/bookings/:id/payment
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Ensure user can only pay for their own booking
    if (booking.user.toString() !== req.user.id) {
      return next(new AppError("Not authorized to process this payment", 403));
    }

    // Check if already paid
    if (booking.paymentStatus === "completed") {
      return next(new AppError("Payment already completed", 400));
    }

    // Update payment status (In real app, integrate with payment gateway)
    booking.paymentStatus = "completed";
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId || `TXN${Date.now()}`;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
