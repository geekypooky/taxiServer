const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide user reference"],
  },
  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Taxi",
    required: [true, "Please provide taxi reference"],
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: [true, "Please provide route reference"],
  },
  rideDate: {
    type: Date,
    required: [true, "Please provide ride date"],
  },
  passengerCount: {
    type: Number,
    required: [true, "Please provide passenger count"],
    min: 1,
    max: 7,
  },
  passengerName: {
    type: String,
    required: [true, "Please provide passenger name"],
  },
  passengerPhone: {
    type: String,
    required: [true, "Please provide passenger phone"],
  },
  pickupLocation: {
    location: String,
    time: String,
  },
  dropLocation: {
    location: String,
    time: String,
  },
  totalAmount: {
    type: Number,
    required: [true, "Please provide total amount"],
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "wallet", "cash"],
    required: false,
  },
  transactionId: {
    type: String,
  },
  bookingStatus: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed",
  },
  cancellationReason: {
    type: String,
  },
  cancelledAt: {
    type: Date,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  bookingId: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique booking ID before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingId = `TAXI${timestamp}${random}`;
  }
  next();
});

// Index for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ rideDate: 1, taxi: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
