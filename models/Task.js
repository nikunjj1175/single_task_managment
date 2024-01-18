const mongoose = require('mongoose');

// Define the subtask schema
const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
});

// Define the task schema
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true,
    default: function() {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 4);
      return currentDate;
    }
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  category: {
    type: String,
    trim: true
  },
  subtasks: [subtaskSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Update the 'updatedAt' field before saving the task
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Task model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
