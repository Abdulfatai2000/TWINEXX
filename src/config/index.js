/**
 * TWINEX Configuration
 *
 * ⚠️ PLACEHOLDER — Replace with your real values before building:
 *   - CLERK_PUBLISHABLE_KEY: from Clerk dashboard → API keys → Publishable key
 *   - API_BASE_URL: your Render deployment URL (e.g. https://twinex-server.onrender.com)
 *     For local dev, use http://localhost:3000
 *     For Expo Go/emulator, use your machine's LAN IP (e.g. http://192.168.1.10:3000)
 */

export const CLERK_PUBLISHABLE_KEY =
  'pk_test_c29jaWFsLWNhdHRsZS00NDkuY2xlcmsuYWNjb3VudHMuZGV2JA';

// ⚠️ Replace with your backend API URL
// Local dev: 'http://localhost:3000'
// Expo Go on physical device: 'http://<your-local-ip>:3000'
// Production (Render): 'https://your-app.onrender.com'
export const API_BASE_URL = 'http://localhost:3000';

// RevenueCat config (unchanged — do not touch)
export * from './revenuecat';