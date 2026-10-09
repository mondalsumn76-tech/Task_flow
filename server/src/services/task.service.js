import { Task } from '../models/Task.js';

// "user" is set LAST so input data can never override the owner.
export const createTask = (userId, data) => Task.create({ ...data, user: userId });
