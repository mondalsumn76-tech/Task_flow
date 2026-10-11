import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in-progress', 'done'];
// 1 = urgent ... 4 = no priority (default)
export const TASK_PRIORITIES = [1, 2, 3, 4];
export const MAX_TAGS = 10;

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
    priority: {
      type: Number,
      min: [1, 'Priority must be between 1 and 4'],
      max: [4, 'Priority must be between 1 and 4'],
      validate: { validator: Number.isInteger, message: 'Priority must be a whole number' },
      default: 4,
    },
    dueDate: { type: Date, default: null },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: { validator: (v) => v.length <= MAX_TAGS, message: `At most ${MAX_TAGS} tags` },
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Most common query: "my tasks, filtered by status, newest first"
taskSchema.index({ user: 1, status: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, tags: 1 });

export const Task = mongoose.model('Task', taskSchema);
