const Taxi = require("../models/Taxi");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const { AppError } = require("../middleware/errorHandler");

// @desc    Search taxis
// @route   GET /api/taxis/search
// @access  Public
exports.searchTaxis = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;

    if (!source || !destination || !date) {
      return next(
        new AppError("Please provide source, destination, and date", 400)
      );
    }

    // Find routes matching criteria
    const routes = await Route.find({
      source: new RegExp(source, "i"),
      destination: new RegExp(destination, "i"),
      isActive: true,
    }).populate("taxi");

    // Get availability for each route (taxis are either available or booked)
    const routesWithAvailability = await Promise.all(
      routes.map(async (route) => {
        const existingBooking = await Booking.findOne({
          route: route._id,
          rideDate: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999),
          },
          bookingStatus: "confirmed",
        });

        const isAvailable = !existingBooking;

        return {
          _id: route._id,
          taxi: route.taxi,
          source: route.source,
          destination: route.destination,
          departureTime: route.departureTime,
          arrivalTime: route.arrivalTime,
          duration: route.duration,
          distance: route.distance,
          price: route.price,
          isAvailable,
          availableSeats: isAvailable ? route.taxi.capacity : 0,
          offers: route.offers,
          discount: route.discount,
        };
      })
    );

    // Filter out routes with no availability
    const availableRoutes = routesWithAvailability.filter((r) => r.isAvailable);

    res.status(200).json({
      success: true,
      count: availableRoutes.length,
      data: availableRoutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured taxis for home page
// @route   GET /api/taxis
// @access  Public
exports.getFeaturedTaxis = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const taxis = await Taxi.find({ isActive: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: taxis.length,
      data: taxis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get taxi details
// @route   GET /api/taxis/:id
// @access  Public
exports.getTaxiDetails = async (req, res, next) => {
  try {
    const taxi = await Taxi.findById(req.params.id);

    if (!taxi) {
      return next(new AppError("Taxi not found", 404));
    }

    // Get associated routes
    const routes = await Route.find({ taxi: taxi._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        taxi,
        routes,
      },
    });
  } catch (error) {
    next(error);
  }
};
