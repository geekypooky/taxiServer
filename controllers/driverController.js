const Driver = require("../models/Driver");
const Taxi = require("../models/Taxi");
const Route = require("../models/Route");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register driver
// @route   POST /api/drivers/register
// @access  Public
const registerDriver = async (req, res) => {
  try {
    const { name, email, phone, password, licenseNumber, address, city, experience } = req.body;

    // Check if driver exists
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { phone }, { licenseNumber }]
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver with this email, phone, or license already exists",
      });
    }

    // Create driver
    const driver = await Driver.create({
      name,
      email,
      phone,
      password,
      licenseNumber,
      address,
      city,
      experience,
    });

    const token = generateToken(driver._id);

    res.status(201).json({
      success: true,
      message: "Driver registered successfully. Awaiting admin approval.",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        isApproved: driver.isApproved,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Driver login
// @route   POST /api/drivers/login
// @access  Public
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const driver = await Driver.findOne({ email });

    if (!driver || !(await driver.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!driver.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Your account is pending admin approval",
      });
    }

    const token = generateToken(driver._id);

    res.json({
      success: true,
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        isApproved: driver.isApproved,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add taxi by driver
// @route   POST /api/drivers/taxi
// @access  Private (Driver)
const addTaxi = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    
    if (!driver.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Your account is not approved yet",
      });
    }

    const {
      name,
      model,
      vehicleNumber,
      taxiType,
      capacity,
      pricePerKm,
      amenities,
      operator,
    } = req.body;

    const taxi = await Taxi.create({
      name,
      model,
      vehicleNumber,
      taxiType,
      capacity,
      pricePerKm,
      driverName: driver.name,
      driverPhone: driver.phone,
      amenities,
      operator,
      isActive: false, // Admin approval required
    });

    res.status(201).json({
      success: true,
      message: "Taxi added successfully. Awaiting admin approval.",
      taxi,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get driver's taxis
// @route   GET /api/drivers/taxis
// @access  Private (Driver)
const getDriverTaxis = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    const taxis = await Taxi.find({ driverPhone: driver.phone });

    res.json({
      success: true,
      taxis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add route by driver
// @route   POST /api/drivers/route
// @access  Private (Driver)
const addRoute = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    const { taxiId, source, destination, departureTime, arrivalTime, duration, distance, price, offers, discount } = req.body;

    // Check if taxi belongs to driver
    const taxi = await Taxi.findOne({ _id: taxiId, driverPhone: driver.phone });
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: "Taxi not found or doesn't belong to you",
      });
    }

    const route = await Route.create({
      taxi: taxiId,
      source,
      destination,
      departureTime,
      arrivalTime,
      duration,
      distance,
      price,
      offers: offers || "",
      discount: discount || 0,
      isActive: false, // Admin approval required
    });

    res.status(201).json({
      success: true,
      message: "Route added successfully. Awaiting admin approval.",
      route,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  addTaxi,
  getDriverTaxis,
  addRoute,
};