import { storage, STORAGE_KEYS } from './storage';
import { DEV_FLAGS } from '../config/dev';

/**
 * UserProfileService
 * 
 * Manages local user profile data (name, email, subscription status).
 */

export const UserProfileService = {
  /**
   * Get the user's local profile
   */
  async getProfile(userId) {
    if (!userId) return null;
    
    const profile = await storage.get(userId, STORAGE_KEYS.USER_PROFILE);
    return profile;
  },

  /**
   * Set the user's local profile (called on login/signup)
   */
  async setProfile(userId, profile) {
    if (!userId) throw new Error('User ID required');
    
    await storage.set(userId, STORAGE_KEYS.USER_PROFILE, profile);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[UserProfileService] setProfile:', profile);
    return profile;
  },

  /**
   * Update subscription status locally
   */
  async setSubscriptionStatus(userId, status, expiresAt = null) {
    if (!userId) throw new Error('User ID required');
    
    const profile = await this.getProfile(userId) || {};
    profile.subscriptionStatus = status;
    profile.subscriptionExpiresAt = expiresAt;
    
    await storage.set(userId, STORAGE_KEYS.USER_PROFILE, profile);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[UserProfileService] setSubscriptionStatus:', profile);
    return profile;
  },

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId) {
    const profile = await this.getProfile(userId);
    return profile?.subscriptionStatus || 'free';
  },

  /**
   * Clear profile
   */
  async clearProfile(userId) {
    if (!userId) return;
    await storage.remove(userId, STORAGE_KEYS.USER_PROFILE);
  },
};

export default UserProfileService;