import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS) || 7,
};

// Called once at startup. A server with a missing or weak secret must not start.
export const assertEnv = () => {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  if (env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
};
