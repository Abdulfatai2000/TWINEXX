const express = require('express');
const router = express.Router();

const { authenticate, ensureUser } = require('../utils/auth');
const User = require('../models/User');
const Connection = require('../models/Connection');

// All connection routes require authentication
router.use(authenticate);

// ── GET /api/connections ───────────────────────────────────────────────────
// Returns active connections for the current user (as requester or target)
router.get('/', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);

    const connections = await Connection.find({
      $or: [
        { requester_id: user._id, status: 'active' },
        { target_id: user._id, status: 'active' },
      ],
    })
      .populate('requester_id', 'name')
      .populate('target_id', 'name')
      .populate('mentor_id', 'name')
      .populate('student_id', 'name')
      .lean();

    const result = connections.map((c) => {
      const otherUser =
        c.requester_id._id.toString() === user._id.toString()
          ? c.target_id
          : c.requester_id;
      const myRole = c.mentor_id._id.toString() === user._id.toString() ? 'mentor' : 'student';

      return {
        id: c._id,
        requester_id: c.requester_id._id,
        target_id: c.target_id._id,
        mentor_id: c.mentor_id._id,
        student_id: c.student_id._id,
        status: c.status,
        createdAt: c.createdAt,
        otherUserName: otherUser?.name || 'Unknown',
        myRole,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/connections/pending ───────────────────────────────────────────
// Returns pending incoming requests for the current user (as target)
router.get('/pending', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);

    const connections = await Connection.find({
      target_id: user._id,
      status: 'pending',
    })
      .populate('requester_id', 'name')
      .lean();

    const result = connections.map((c) => ({
      id: c._id,
      requester_id: c.requester_id._id,
      requesterName: c.requester_id?.name || 'Unknown',
      target_id: c.target_id,
      mentor_id: c.mentor_id,
      student_id: c.student_id,
      status: c.status,
      createdAt: c.createdAt,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/connections ──────────────────────────────────────────────────
// Create a connection request (requester enters target's PIN)
router.post('/', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const { targetPin } = req.body;

    if (!targetPin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Look up target by PIN
    const targetUser = await User.findOne({ pin: String(targetPin).toUpperCase() });
    if (!targetUser) {
      return res.status(404).json({ error: 'No user found with that PIN' });
    }

    if (targetUser._id.toString() === user._id.toString()) {
      return res.status(400).json({ error: "That's your own PIN!" });
    }

    // Check for existing connection
    const existing = await Connection.findOne({
      $or: [
        { requester_id: user._id, target_id: targetUser._id },
        { requester_id: targetUser._id, target_id: user._id },
      ],
      status: { $in: ['pending', 'active'] },
    });

    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending or active connection with this person.',
      });
    }

    const connection = await Connection.create({
      requester_id: user._id,
      target_id: targetUser._id,
      mentor_id: targetUser._id, // PIN owner is mentor
      student_id: user._id,      // requester is student
      status: 'pending',
    });

    res.status(201).json({
      id: connection._id,
      requester_id: connection.requester_id,
      target_id: connection.target_id,
      mentor_id: connection.mentor_id,
      student_id: connection.student_id,
      status: connection.status,
      createdAt: connection.createdAt,
      targetName: targetUser.name,
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/connections/:id ─────────────────────────────────────────────
// Accept (status → active) or decline (status → declined) a connection request
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const { status } = req.body;

    if (!['active', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Only the target can accept/decline
    if (connection.target_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    connection.status = status;
    await connection.save();

    res.json({
      id: connection._id,
      status: connection.status,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;