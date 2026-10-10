import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'token';

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: `${env.jwtExpiresDays}d`,
  });

// Pinning the algorithm blocks "alg: none" and algorithm-confusion attacks
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });

// The client proxies /api through its own domain (Vercel rewrite), so the
// cookie is first-party: SameSite=Lax, plus Secure in production.
const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
});

export const setAuthCookie = (res, token) =>
  res.cookie(AUTH_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: env.jwtExpiresDays * 24 * 60 * 60 * 1000,
  });

// Must use the same options the cookie was set with, or the browser ignores it
export const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE, baseCookieOptions());
