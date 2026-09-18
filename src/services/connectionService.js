import { storage, STORAGE_KEYS } from './storage';
import { DEV_FLAGS } from '../config/dev';

/**
 * ConnectionService
 * 
 * Manages connection requests and active connections locally.
 * 
 * Data models:
 * 
 * Incoming Request (stored under target user):
 * {
 *   id: string,
 *   requesterId: string,
 *   requesterName: string,
 *   requesterPin: string,
 *   status: 'pending',
 *   createdAt: string (ISO),
 * }
 * 
 * Active Connection (stored for both users):
 * {
 *   id: string,
 *   requesterId: string,
 *   targetId: string,
 *   mentorId: string,
 *   studentId: string,
 *   status: 'active',
 *   createdAt: string (ISO),
 *   otherUserName: string,
 *   myRole: 'mentor' | 'student',
 * }
 */

const generateId = () => `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const nowISO = () => new Date().toISOString();

// In-memory store for cross-user lookup (since local mode can't do real cross-device)
// In production, this would be the database
const mockUserRegistry = new Map(); // pin -> { id, name, pin }

/**
 * Register a user in the mock registry (called on login/signup)
 */
export const registerLocalUser = (userId, name, pin) => {
  mockUserRegistry.set(pin, { id: userId, name, pin });
  if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] Registered user:', { id: userId, name, pin });
};

/**
 * Look up a user by PIN
 */
export const findUserByPin = (pin) => {
  return mockUserRegistry.get(pin.toUpperCase()) || null;
};

export const ConnectionService = {
  /**
   * Get all active connections for the current user
   */
  async getConnections(userId) {
    if (!userId) return [];
    
    const connections = await storage.get(userId, STORAGE_KEYS.CONNECTIONS);
    if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] getConnections:', connections?.length || 0);
    return connections || [];
  },

  /**
   * Get pending incoming connection requests for the current user
   */
  async getIncomingRequests(userId) {
    if (!userId) return [];
    
    const requests = await storage.get(userId, STORAGE_KEYS.INCOMING_REQUESTS);
    if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] getIncomingRequests:', requests?.length || 0);
    return requests || [];
  },

  /**
   * Send a connection request by PIN
   */
  async sendConnectionRequest(userId, userName, targetPin) {
    if (!userId) throw new Error('User ID required');
    
    const normalizedPin = targetPin.trim().toUpperCase();
    
    // Can't connect to yourself
    const myPin = await storage.get(userId, STORAGE_KEYS.PIN);
    if (myPin === normalizedPin) {
      throw new Error("That's your own PIN!");
    }

    // Look up target user
    const targetUser = findUserByPin(normalizedPin);
    if (!targetUser) {
      throw new Error('No user found with that PIN');
    }

    // Check for existing connection/request
    const connections = await this.getConnections(userId);
    const incomingRequests = await this.getIncomingRequests(userId);
    const targetIncoming = await storage.get(targetUser.id, STORAGE_KEYS.INCOMING_REQUESTS) || [];
    const targetConnections = await storage.get(targetUser.id, STORAGE_KEYS.CONNECTIONS) || [];

    // Check if already connected or pending
    const hasExisting = 
      connections.some(c => 
        (c.requesterId === userId && c.targetId === targetUser.id) ||
        (c.requesterId === targetUser.id && c.targetId === userId)
      ) ||
      incomingRequests.some(r => r.requesterId === targetUser.id) ||
      targetIncoming.some(r => r.requesterId === userId) ||
      targetConnections.some(c => 
        (c.requesterId === userId && c.targetId === targetUser.id) ||
        (c.requesterId === targetUser.id && c.targetId === userId)
      );

    if (hasExisting) {
      throw new Error('You already have a pending or active connection with this person.');
    }

    // Create the incoming request for the target user
    const request = {
      id: generateId(),
      requesterId: userId,
      requesterName: userName,
      requesterPin: myPin,
      status: 'pending',
      createdAt: nowISO(),
    };

    // Store incoming request for target user
    targetIncoming.push(request);
    await storage.set(targetUser.id, STORAGE_KEYS.INCOMING_REQUESTS, targetIncoming);

    if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] sendConnectionRequest:', request);
    return {
      ...request,
      targetName: targetUser.name,
    };
  },

  /**
   * Approve a connection request
   */
  async approveRequest(userId, requestId) {
    if (!userId) throw new Error('User ID required');
    
    const incomingRequests = await this.getIncomingRequests(userId);
    const requestIndex = incomingRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    const request = incomingRequests[requestIndex];
    
    // Create active connection for both users
    const connection = {
      id: generateId(),
      requesterId: request.requesterId,
      targetId: userId,
      mentorId: userId, // PIN owner is mentor
      studentId: request.requesterId,
      status: 'active',
      createdAt: nowISO(),
    };

    // Add to requester's connections
    const requesterConnections = await storage.get(request.requesterId, STORAGE_KEYS.CONNECTIONS) || [];
    requesterConnections.push({
      ...connection,
      otherUserName: request.requesterName, // This will be the target's name for requester
      myRole: 'student',
    });
    await storage.set(request.requesterId, STORAGE_KEYS.CONNECTIONS, requesterConnections);

    // Add to target's connections
    const targetConnections = await storage.get(userId, STORAGE_KEYS.CONNECTIONS) || [];
    targetConnections.push({
      ...connection,
      otherUserName: request.requesterName,
      myRole: 'mentor',
    });
    await storage.set(userId, STORAGE_KEYS.CONNECTIONS, targetConnections);

    // Remove from incoming requests
    incomingRequests.splice(requestIndex, 1);
    await storage.set(userId, STORAGE_KEYS.INCOMING_REQUESTS, incomingRequests);

    if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] approveRequest:', connection);
    return connection;
  },

  /**
   * Decline a connection request
   */
  async declineRequest(userId, requestId) {
    if (!userId) throw new Error('User ID required');
    
    const incomingRequests = await this.getIncomingRequests(userId);
    const requestIndex = incomingRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    incomingRequests.splice(requestIndex, 1);
    await storage.set(userId, STORAGE_KEYS.INCOMING_REQUESTS, incomingRequests);

    if (DEV_FLAGS.LOG_STORAGE) console.log('[ConnectionService] declineRequest:', requestId);
    return { success: true };
  },

  /**
   * Clear all connection data (for testing/reset)
   */
  async clearAllConnections(userId) {
    if (!userId) return;
    await storage.remove(userId, STORAGE_KEYS.CONNECTIONS);
    await storage.remove(userId, STORAGE_KEYS.INCOMING_REQUESTS);
  },
};

export default ConnectionService;