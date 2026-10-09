import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in-progress', 'done'];

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be one of: todo, in-progress, done',
      },
      default: 'todo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Most common query: "my tasks, filtered by status, newest first"
taskSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);
