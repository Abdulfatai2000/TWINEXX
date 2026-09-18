/**
 * TWINEX Configuration
 *
 * Environment variables are loaded from .env.local
 * See .env.example for required configuration
 */

export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. ' +
    'Create a .env.local file and add your Clerk Publishable Key from https://dashboard.clerk.com/~/api-keys'
  );
}

// ⚠️ Replace with your backend API URL
// Local dev: 'http://localhost:3000'
// Expo Go on physical device: 'http://<your-local-ip>:3000'
// Production (Render): 'https://your-app.onrender.com'
export const API_BASE_URL = 'http://localhost:3000';

// RevenueCat config (unchanged — do not touch)
export * from './revenuecat';