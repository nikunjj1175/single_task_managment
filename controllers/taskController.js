// taskController.js

const Task = require('../models/Task');
const cron = require('node-cron');
const logger = require('../utils/logger');

// Controller function for creating a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, category } = req.body;
        const task = new Task({ title, description, dueDate, priority, category, userId: req.user.userId });
        // console.log("task", task);
        await task.save();
        logger.info(`Task created successfully: ${task}`);
        res.status(201).json({ message: 'Task created successfully!', task });
    } catch (error) {
        logger.error(`Error creating task: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Controller function for retrieving all tasks for a user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            userId: req.user.userId,
        });
        // console.log(tasks);
        res.json(tasks);
    } catch (error) {
        logger.error(`Error retrieving tasks: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

const checkRemindersAndSendNotifications = async () => {
    try {
        const currentDateTime = new Date();
        const tenMinutesFromNow = new Date(currentDateTime.getTime() + 10 * 60000);

        // Fetch tasks that have a dueDate in the next 1 minutes
        const tasks = await Task.find({
            dueDate: {
                $gte: currentDateTime,
                $lt: tenMinutesFromNow
            }
        });

        for (const task of tasks) {
            const reminderMessage = `Task Reminder: "${task.title}" is due in 1 minutes!`;
            console.log(reminderMessage);
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
};

// Schedule the reminder check to run every minute
cron.schedule('* * * * *', checkRemindersAndSendNotifications);

// Controller function for updating a task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, priority, category, status } = req.body;
        const task = await Task.findByIdAndUpdate(id, { title, description, dueDate, priority, category, status }, { new: true });
        // console.log("task :",task);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        logger.info(`Task updated successfully: ${task}`);
        res.json({ message: 'Task updated successfully!', task });
    } catch (error) {
        logger.error(`Error updating task: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Controller function for deleting a task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        logger.info(`Task deleted successfully: ${task}`);
        res.json({ message: 'Task deleted successfully!' });
    } catch (error) {
        logger.error(`Error deleting task: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Controller function for retrieving tasks with filtering functionality
exports.filtertask = async (req, res) => {
    try {
        let query = { userId: req.user.userId };

        // Extract title and additional filtering parameters from request body or query parameters
        const { title, status, priority } = req.body || req.query;

        // Search by title
        if (title) {
            query.title = { $regex: new RegExp(title, 'i') }; // Case-insensitive search
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by priority
        if (priority) {
            query.priority = priority;
        }

        const tasks = await Task.find(query);
        res.json(tasks);
    } catch (error) {
        logger.error(`Error filtering tasks: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

exports.createSubtask = async (req, res) => {
    try {
        const { id } = req.params; // Parent task ID
        const { title, description } = req.body;
        
        const parentTask = await Task.findById(id);

        if (!parentTask) {
            return res.status(404).json({ error: 'Parent Task not found' });
        }

        const subtask = {
            title,
            description,
        };

        parentTask.subtasks.push(subtask);
        await parentTask.save();

        // console.log("subtask :---",subtask);
        logger.info(`Subtask created successfully: ${subtask}`);
        res.status(201).json({ message: 'Subtask created successfully!', subtask });
    } catch (error) {
        logger.error(`Error creating subtask: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

exports.getSubtasks = async (req, res) => {
    try {
        const { id } = req.params; // Parent task ID
        const parentTask = await Task.findById(id);

        if (!parentTask) {
            return res.status(404).json({ error: 'Parent Task not found' });
        }

        const subtasks = parentTask.subtasks;
        res.json(subtasks);
    } catch (error) {
        logger.error(`Error retrieving subtasks: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

exports.updateSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;
        const { title, description, dueDate, priority, status } = req.body;

        const parentTask = await Task.findById(taskId);

        if (!parentTask) {
            return res.status(404).json({ error: 'Parent Task not found' });
        }

        const subtaskIndex = parentTask.subtasks.findIndex(subtask => subtask._id.toString() === subtaskId);

        if (subtaskIndex === -1) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const updatedSubtask = {
            title,
            description,
            dueDate,
            priority,
            status,
        };

        parentTask.subtasks[subtaskIndex] = updatedSubtask;
        await parentTask.save();

        logger.info(`Subtask updated successfully: ${updatedSubtask}`);
        res.json({ message: 'Subtask updated successfully!', subtask: updatedSubtask });
    } catch (error) {
        logger.error(`Error updating subtask: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};

exports.deleteSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;

        const parentTask = await Task.findById(taskId);

        if (!parentTask) {
            return res.status(404).json({ error: 'Parent Task not found' });
        }

        const subtaskIndex = parentTask.subtasks.findIndex(subtask => subtask._id.toString() === subtaskId);

        if (subtaskIndex === -1) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const deletedSubtask = parentTask.subtasks.splice(subtaskIndex, 1)[0];
        await parentTask.save();

        logger.info(`Subtask deleted successfully: ${deletedSubtask}`);
        res.json({ message: 'Subtask deleted successfully!' });
    } catch (error) {
        logger.error(`Error deleting subtask: ${error.message}`, { error: error });
        res.status(400).json({ error: error.message });
    }
};