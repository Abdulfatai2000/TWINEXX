const express = require('express');
const router = express.Router();

const { authenticate, ensureUser } = require('../utils/auth');

// ── PATCH /api/users/me ────────────────────────────────────────────────────
// Updates subscription fields. Called by RevenueCat sync.
// Only allows updating subscription_status and subscription_expires_at.
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const { subscription_status, subscription_expires_at } = req.body;

    if (subscription_status !== undefined) {
      if (!['free', 'premium'].includes(subscription_status)) {
        return res.status(400).json({ error: 'Invalid subscription_status' });
      }
      user.subscription_status = subscription_status;
    }

    if (subscription_expires_at !== undefined) {
      user.subscription_expires_at = subscription_expires_at
        ? new Date(subscription_expires_at)
        : null;
    }

    await user.save();

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