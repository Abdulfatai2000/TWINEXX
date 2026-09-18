import { storage, STORAGE_KEYS } from './storage';
import { generateLocalPin, DEV_FLAGS, isLocalMode } from '../config/dev';

/**
 * TaskService
 * 
 * Local-first task management using AsyncStorage.
 * Falls back to API when in remote mode.
 * 
 * Data model:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   dueDate: string (ISO) | null,
 *   status: 'pending' | 'done',
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 * }
 */

const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const nowISO = () => new Date().toISOString();

export const TaskService = {
  /**
   * Get all tasks for the current user
   */
  async getTasks(userId) {
    if (!userId) return [];
    
    const tasks = await storage.get(userId, STORAGE_KEYS.TASKS);
    if (DEV_FLAGS.LOG_STORAGE) console.log('[TaskService] getTasks:', tasks?.length || 0);
    return tasks || [];
  },

  /**
   * Create a new task
   */
  async createTask(userId, { title, description = '', dueDate = null }) {
    if (!userId) throw new Error('User ID required');
    
    const task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      status: 'pending',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    const tasks = await this.getTasks(userId);
    tasks.unshift(task); // Add to beginning (newest first)
    await storage.set(userId, STORAGE_KEYS.TASKS, tasks);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[TaskService] createTask:', task);
    return task;
  },

  /**
   * Update an existing task
   */
  async updateTask(userId, taskId, updates) {
    if (!userId) throw new Error('User ID required');
    
    const tasks = await this.getTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      throw new Error('Task not found');
    }

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: nowISO(),
    };

    await storage.set(userId, STORAGE_KEYS.TASKS, tasks);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[TaskService] updateTask:', tasks[index]);
    return tasks[index];
  },

  /**
   * Toggle task status between pending and done
   */
  async toggleTaskStatus(userId, taskId) {
    const tasks = await this.getTasks(userId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) throw new Error('Task not found');
    
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    return this.updateTask(userId, taskId, { status: newStatus });
  },

  /**
   * Delete a task
   */
  async deleteTask(userId, taskId) {
    if (!userId) throw new Error('User ID required');
    
    const tasks = await this.getTasks(userId);
    const filtered = tasks.filter(t => t.id !== taskId);
    
    if (filtered.length === tasks.length) {
      throw new Error('Task not found');
    }

    await storage.set(userId, STORAGE_KEYS.TASKS, filtered);
    
    if (DEV_FLAGS.LOG_STORAGE) console.log('[TaskService] deleteTask:', taskId);
    return { success: true };
  },

  /**
   * Clear all tasks (for testing/reset)
   */
  async clearAllTasks(userId) {
    if (!userId) return;
    await storage.remove(userId, STORAGE_KEYS.TASKS);
  },
};

export default TaskService;