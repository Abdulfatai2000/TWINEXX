const express = require('express');
const router = express.Router();

const { authenticate, ensureUser } = require('../utils/auth');

// ── POST /api/auth/sync ─────────────────────────────────────────────────────
// Called by the frontend after Clerk sign-up/sign-in to ensure a MongoDB
// user document exists (auto-creates on first login with a unique PIN).
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    res.json({
      id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      pin: user.pin,
      subscription_status: user.subscription_status,
      subscription_expires_at: user.subscription_expires_at,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
// Returns the current user's profile (must be authenticated).
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    res.json({
      id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      pin: user.pin,
      subscription_status: user.subscription_status,
      subscription_expires_at: user.subscription_expires_at,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;