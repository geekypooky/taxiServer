const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide driver name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  licenseNumber: {
    type: String,
    required: [true, "Please provide license number"],
    unique: true,
  },
  address: {
    type: String,
    required: [true, "Please provide address"],
  },
  city: {
    type: String,
    required: [true, "Please provide city"],
  },
  experience: {
    type: Number,
    required: [true, "Please provide years of experience"],
    min: 0,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
driverSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Driver", driverSchema);