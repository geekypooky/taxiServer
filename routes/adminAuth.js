const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  registerAdmin,
  loginAdmin,
  getMe,
} = require("../controllers/adminAuthController");
const { protectAdmin } = require("../middleware/auth");

// Validation middleware
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, registerAdmin);
router.post("/login", loginValidation, loginAdmin);
router.get("/me", protectAdmin, getMe);

module.exports = router;
