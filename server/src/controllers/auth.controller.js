import * as authService from '../services/auth.service.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { toUserResponse } from '../utils/userSerializer.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = async (req, res) => {
  const data = validateRegister(req.body);
  const user = await authService.registerUser(data);

  setAuthCookie(res, signToken(user.id));
  res.status(201).json({ success: true, data: { user: toUserResponse(user) } });
};

export const login = async (req, res) => {
  const data = validateLogin(req.body);
  const user = await authService.loginUser(data);

  setAuthCookie(res, signToken(user.id));
  res.status(200).json({ success: true, data: { user: toUserResponse(user) } });
};

// Idempotent and public: logging out twice is not an error
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: 'Logged out' });
};

export const me = (req, res) => {
  res.status(200).json({ success: true, data: { user: toUserResponse(req.user) } });
};
