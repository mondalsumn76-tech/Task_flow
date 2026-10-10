import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE, verifyToken } from '../utils/token.js';

// Sets req.user to the full user document, so req.user.id works for task code.
export const protect = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    // Expired, tampered, or malformed: one generic message for all of them
    throw new AppError('Invalid or expired session', 401);
  }

  // Load the user on every request, so a deleted account stops working at once
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('Invalid or expired session', 401);

  req.user = user;
  next();
};
