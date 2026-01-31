const mongoose = require("mongoose");

const taxiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide taxi name"],
    trim: true,
  },
  model: {
    type: String,
    required: [true, "Please provide taxi model"],
  },
  vehicleNumber: {
    type: String,
    required: [true, "Please provide vehicle number"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  taxiType: {
    type: String,
    enum: ["Mini", "Sedan", "SUV", "Luxury", "Premium"],
    required: [true, "Please specify taxi type"],
  },
  capacity: {
    type: Number,
    required: [true, "Please specify passenger capacity"],
    min: 1,
    max: 10,
    default: 4,
  },
  pricePerKm: {
    type: Number,
    required: [true, "Please provide price per km"],
  },
  driverName: {
    type: String,
    required: [true, "Please provide driver name"],
  },
  driverPhone: {
    type: String,
    required: [true, "Please provide driver phone"],
  },
  amenities: [
    {
      type: String,
      enum: [
        "AC",
        "Music System",
        "GPS",
        "Child Seat",
        "Spacious Boot",
        "Phone Charger",
        "WiFi",
      ],
    },
  ],
  operator: {
    type: String,
    required: [true, "Please provide operator name"],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
taxiSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Taxi", taxiSchema);
