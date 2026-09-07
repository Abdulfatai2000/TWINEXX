const express = require('express');
const router = express.Router();

const { authenticate, ensureUser } = require('../utils/auth');
const Task = require('../models/Task');

// All task routes require authentication
router.use(authenticate);

// ── GET /api/tasks ──────────────────────────────────────────────────────────
// Returns the current user's tasks, newest first.
router.get('/', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const tasks = await Task.find({ ownerId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      tasks.map((t) => ({
        id: t._id,
        ownerId: t.ownerId,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        status: t.status,
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// ── POST /api/tasks ─────────────────────────────────────────────────────────
// Creates a new task for the authenticated user.
router.post('/', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const { title, description, dueDate } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = await Task.create({
      ownerId: user._id,
      title: title.trim(),
      description: description ? String(description).trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
    });

    res.status(201).json({
      id: task._id,
      ownerId: task.ownerId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/tasks/:id ────────────────────────────────────────────────────
// Updates a task. Only the owner can update it.
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const taskId = req.params.id;
    const { title, description, dueDate, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership check
    if (task.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) {
      if (!['pending', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      task.status = status;
    }

    await task.save();

    res.json({
      id: task._id,
      ownerId: task.ownerId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/tasks/:id ───────────────────────────────────────────────────
// Deletes a task. Only the owner can delete it.
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await ensureUser(req.clerkUserId);
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await task.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;