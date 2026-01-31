const express = require("express");
const router = express.Router();
const {
  addTaxi,
  updateTaxi,
  deleteTaxi,
  getAllTaxis,
  addRoute,
  updateRoute,
  deleteRoute,
  getAllRoutes,

  getAllBookings,
  getStats,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/auth");

// All routes require admin authentication
router.use(protectAdmin);

// Taxi routes
router.route("/taxis").get(getAllTaxis).post(addTaxi);

router.route("/taxis/:id").put(updateTaxi).delete(deleteTaxi);

// Route routes
router.route("/routes").get(getAllRoutes).post(addRoute);

router.route("/routes/:id").put(updateRoute).delete(deleteRoute);



// Booking routes
router.get("/bookings", getAllBookings);

// Statistics
router.get("/stats", getStats);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserStatus);

module.exports = router;
