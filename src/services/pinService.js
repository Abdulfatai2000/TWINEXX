import { storage, STORAGE_KEYS } from './storage';
import { generateLocalPin, DEV_FLAGS } from '../config/dev';

/**
 * PinService
 * 
 * Manages the user's 6-digit PIN locally.
 * PIN is generated once and persists across sessions.
 */

export const PinService = {
  /**
   * Get the user's PIN, generating one if it doesn't exist
   */
  async getPin(userId) {
    if (!userId) return null;
    
    let pin = await storage.get(userId, STORAGE_KEYS.PIN);
    
    if (!pin) {
      pin = generateLocalPin();
      await storage.set(userId, STORAGE_KEYS.PIN, pin);
      if (DEV_FLAGS.LOG_STORAGE) console.log('[PinService] Generated new PIN:', pin);
    } else if (DEV_FLAGS.LOG_STORAGE) {
      console.log('[PinService] Retrieved existing PIN:', pin);
    }
    
    return pin;
  },

  /**
   * Regenerate the user's PIN (for testing)
   */
  async regeneratePin(userId) {
    if (!userId) throw new Error('User ID required');
    
    const pin = generateLocalPin();
    await storage.set(userId, STORAGE_KEYS.PIN, pin);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[PinService] Regenerated PIN:', pin);
    return pin;
  },

  /**
   * Clear the user's PIN
   */
  async clearPin(userId) {
    if (!userId) return;
    await storage.remove(userId, STORAGE_KEYS.PIN);
  },
};

export default PinService;