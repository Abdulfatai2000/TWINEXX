/**
 * Development Configuration
 * 
 * Centralized configuration for local development mode.
 * Allows toggling between local and production data modes.
 * 
 * DO NOT COMMIT PRODUCTION CREDENTIALS HERE.
 * Use environment variables or secure config for production.
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATA MODE
// ─────────────────────────────────────────────────────────────────────────────
// 'local'   → Use AsyncStorage-based local services (no backend required)
// 'remote'  → Use Express/MongoDB backend (requires running server)
//
// Set to 'local' for Phase 1 development without backend.
export const DATA_MODE = 'local';

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION MODE
// ─────────────────────────────────────────────────────────────────────────────
// 'development' → Simulate premium status locally, bypass RevenueCat
// 'production'  → Use real RevenueCat integration (requires valid API keys)
//
// Set to 'development' for Phase 1 to avoid "Invalid API key" errors.
export const SUBSCRIPTION_MODE = 'development';

// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPMENT PREMIUM STATE
// ─────────────────────────────────────────────────────────────────────────────
// When SUBSCRIPTION_MODE === 'development', this controls the simulated
// premium state. Toggle to test free/premium UI states.
export const DEV_SIMULATE_PREMIUM = false;

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG FLAGS
// ─────────────────────────────────────────────────────────────────────────────
export const DEV_FLAGS = {
  // Log storage operations
  LOG_STORAGE: true,
  // Log API calls
  LOG_API: true,
  // Show development badges in UI
  SHOW_DEV_BADGES: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// PIN GENERATION (Local Mode)
// ─────────────────────────────────────────────────────────────────────────────
export const generateLocalPin = () => {
  // Generate a 6-digit PIN
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check if we're in local mode
// ─────────────────────────────────────────────────────────────────────────────
export const isLocalMode = () => DATA_MODE === 'local';

export const isDevelopmentSubscriptionMode = () => SUBSCRIPTION_MODE === 'development';

export default {
  DATA_MODE,
  SUBSCRIPTION_MODE,
  DEV_SIMULATE_PREMIUM,
  DEV_FLAGS,
  generateLocalPin,
  isLocalMode,
  isDevelopmentSubscriptionMode,
};