const express = require("express");
const router = express.Router();
const {
  searchTaxis,
  getTaxiDetails,
  getFeaturedTaxis,
} = require("../controllers/taxiController");

// Routes
router.get("/", getFeaturedTaxis);
router.get("/search", searchTaxis);
router.get("/:id", getTaxiDetails);

module.exports = router;
