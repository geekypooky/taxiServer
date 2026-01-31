const express = require("express");
const {
  registerDriver,
  loginDriver,
  addTaxi,
  getDriverTaxis,
  addRoute,
} = require("../controllers/driverController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", registerDriver);
router.post("/login", loginDriver);

// Protected routes (require driver authentication)
router.post("/taxi", protect, addTaxi);
router.get("/taxis", protect, getDriverTaxis);
router.post("/route", protect, addRoute);

module.exports = router;