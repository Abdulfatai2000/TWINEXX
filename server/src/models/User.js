const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    pin: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subscription_status: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    subscription_expires_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);