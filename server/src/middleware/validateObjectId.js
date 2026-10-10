import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid task id', 400));
  }
  next();
};
