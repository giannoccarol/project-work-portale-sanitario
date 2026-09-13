import 'dotenv/config';
import { randomBytes } from 'crypto';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const configuredSecret = process.env.JWT_SECRET?.trim();

if (isProduction && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('JWT_SECRET obbligatorio in produzione e lungo almeno 32 caratteri');
}

const configuredOrigins = process.env.CORS_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !configuredOrigins?.length) {
  throw new Error('CORS_ORIGINS obbligatorio in produzione');
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: configuredSecret || randomBytes(32).toString('hex'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
  apiBasePath: '/api/v1',
  corsOrigins: configuredOrigins?.length
    ? configuredOrigins
    : ['http://localhost:4200', 'http://127.0.0.1:4200'],
  authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60_000,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
};
