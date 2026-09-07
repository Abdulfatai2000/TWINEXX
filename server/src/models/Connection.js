const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate connections between same two users
connectionSchema.index({
  requester_id: 1,
  target_id: 1,
}, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);