// taskRoutes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

// Route to create a new task
router.post('/', 
  authenticate,
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  validate,
  taskController.createTask
);

// Route to retrieve all tasks for a user
router.get('/', authenticate, taskController.getTasks);

// Route to update a specific task
router.put('/:id', 
  authenticate,
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601(),
  validate,
  taskController.updateTask
);

// Route to delete a specific task
router.delete('/:id', authenticate, taskController.deleteTask);

// Retrieve tasks with filter task
router.get('/filter', authenticate, taskController.filtertask);

// Route to create a subtask under a specific task
router.post('/:id/subtasks',
    authenticate,
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    validate,
    taskController.createSubtask
);

// Route to retrieve all subtasks for a specific task
router.get('/:id/subtasks', authenticate, taskController.getSubtasks);

// Route to update a specific subtask of a specific task
router.put('/:taskId/subtasks/:subtaskId',
    authenticate,
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601(),
    validate,
    taskController.updateSubtask
);

// Route to delete a specific subtask of a specific task
router.delete('/:taskId/subtasks/:subtaskId', authenticate, taskController.deleteSubtask);

module.exports = router;
