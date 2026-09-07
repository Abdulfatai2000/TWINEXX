/**
 * RevenueCat Configuration
 *
 * MANUAL SETUP REQUIRED:
 * 1. Create a RevenueCat account at https://app.revenuecat.com
 * 2. Create a new project for TWINIX
 * 3. Add your iOS app (using the bundle ID in app.json → expo.ios.bundleIdentifier)
 * 4. Add your Android app (using the package name in app.json → expo.android.package)
 * 5. Replace the placeholder API keys below with your real ones from the RevenueCat dashboard
 *
 * Product ID: Make sure "twinix_premium_monthly" matches exactly what you create in:
 *  - App Store Connect (auto-renewable subscription)
 *  - Google Play Console (subscription product)
 *
 * Entitlement: Create an entitlement named "premium" in RevenueCat and attach this product.
 * Offering: Create a default offering containing a package with this product.
 */

import { Platform } from 'react-native';

// ⚠️ Replace these with your real RevenueCat API keys from the dashboard
export const REVENUECAT_API_KEY_IOS = 'appl_PLACEHOLDER_REPLACE_ME';
export const REVENUECAT_API_KEY_ANDROID = 'goog_PLACEHOLDER_REPLACE_ME';

// The platform-appropriate key, used for SDK initialisation
export const REVENUECAT_API_KEY =
  Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

// The RevenueCat entitlement identifier that maps to Premium status
export const PREMIUM_ENTITLEMENT_ID = 'premium';

// The product ID configured in App Store Connect & Google Play Console
export const TWINIX_PREMIUM_MONTHLY = 'twinix_premium_monthly';
