const { verifyToken } = require('@clerk/backend');
const User = require('../models/User');

// ── Generate a unique 6-digit PIN ───────────────────────────────────────────
const generateRandomPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateUniquePin = async () => {
  let isUnique = false;
  let pin = '';

  while (!isUnique) {
    pin = generateRandomPin();
    const existing = await User.findOne({ pin });
    if (!existing) {
      isUnique = true;
    }
  }

  return pin;
};

// ── Verify Clerk session token from request headers ─────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }

    // Verify the JWT token
    const verifiedToken = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: [
        'http://localhost:8081',
        'http://localhost:19006',
        'exp://localhost:8081',
        // Add your production frontend URL
      ],
    });

    if (!verifiedToken || !verifiedToken.sub) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    req.clerkUserId = verifiedToken.sub;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// ── Get or create the MongoDB user for the authenticated Clerk user ─────────
const ensureUser = async (clerkUserId) => {
  let user = await User.findOne({ clerkId: clerkUserId });

  if (user) {
    return user;
  }

  // Fetch Clerk user details for name/email
  let clerkUser = null;
  try {
    const { clerkClient } = require('@clerk/clerk-sdk-node');
    clerkUser = await clerkClient.users.getUser(clerkUserId);
  } catch (e) {
    console.warn('Could not fetch Clerk user details:', e.message);
  }

  const name =
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'User';

  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    '';

  const pin = await generateUniquePin();

  user = await User.create({
    clerkId: clerkUserId,
    name,
    email,
    pin,
    subscription_status: 'free',
    subscription_expires_at: null,
  });

  return user;
};

module.exports = { authenticate, ensureUser, generateUniquePin };