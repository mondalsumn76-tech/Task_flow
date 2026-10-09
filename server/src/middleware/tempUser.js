import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// TEMPORARY: replaced by real JWT authentication on the auth day.
// Every request pretends to come from one fixed user, so we can build
// user-scoped task logic now. It refuses to run in production.
const TEMP_USER_ID = '000000000000000000000001';

export const tempUser = (req, res, next) => {
  if (env.nodeEnv === 'production') {
    return next(new AppError('Authentication required', 401));
  }
  req.user = { id: TEMP_USER_ID };
  next();
};
