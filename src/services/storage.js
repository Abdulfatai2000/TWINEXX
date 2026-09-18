import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LocalStorageAdapter
 * 
 * Abstracts AsyncStorage with user-scoped namespacing.
 * All data is prefixed with the authenticated Clerk user ID.
 * 
 * Later this can be swapped for a ProductionDatabaseAdapter
 * without changing the service layer.
 */

const STORAGE_PREFIX = '@twinix';

/**
 * Get the namespaced key for the current user
 */
const getUserKey = (userId, key) => {
  if (!userId) {
    throw new Error('User ID required for storage operations');
  }
  return `${STORAGE_PREFIX}:${userId}:${key}`;
};

/**
 * Generic get/set/remove with user scoping
 */
export const storage = {
  async get(userId, key) {
    try {
      const namespacedKey = getUserKey(userId, key);
      const value = await AsyncStorage.getItem(namespacedKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      return null;
    }
  },

  async set(userId, key, value) {
    try {
      const namespacedKey = getUserKey(userId, key);
      await AsyncStorage.setItem(namespacedKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
      return false;
    }
  },

  async remove(userId, key) {
    try {
      const namespacedKey = getUserKey(userId, key);
      await AsyncStorage.removeItem(namespacedKey);
      return true;
    } catch (error) {
      console.error(`Storage remove error for ${key}:`, error);
      return false;
    }
  },

  async clearAll(userId) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(k => k.startsWith(`${STORAGE_PREFIX}:${userId}:`));
      await AsyncStorage.multiRemove(userKeys);
      return true;
    } catch (error) {
      console.error('Storage clearAll error:', error);
      return false;
    }
  },
};

/**
 * Non-user-scoped storage (for onboarding flags, etc.)
 */
export const globalStorage = {
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(`${STORAGE_PREFIX}:global:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Global storage get error for ${key}:`, error);
      return null;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}:global:${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Global storage set error for ${key}:`, error);
      return false;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(`${STORAGE_PREFIX}:global:${key}`);
      return true;
    } catch (error) {
      console.error(`Global storage remove error for ${key}:`, error);
      return false;
    }
  },
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  // User-scoped
  TASKS: 'tasks',
  PIN: 'pin',
  CONNECTIONS: 'connections',
  INCOMING_REQUESTS: 'incomingRequests',
  USER_PROFILE: 'userProfile',
  SUBSCRIPTION_STATUS: 'subscriptionStatus',
  
  // Global
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  ONBOARDING_REASON: 'reason',
  ONBOARDING_ROLE_INTENT: 'roleIntent',
  DEV_PREMIUM_MODE: 'devPremiumMode',
};

export default storage;