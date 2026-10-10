import bcrypt from 'bcryptjs';
import { User, BCRYPT_ROUNDS } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// Compared against when the email doesn't exist, so "unknown email" takes as long
// as "wrong password". This stops attackers from discovering which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-attack-dummy', BCRYPT_ROUNDS);

export const registerUser = ({ name, email, password }) => User.create({ name, email, password });

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }
  return user;
};
