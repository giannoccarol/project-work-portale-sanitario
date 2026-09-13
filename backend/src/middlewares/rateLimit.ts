import { rateLimit } from 'express-rate-limit';
import { config } from '../config/env';

export const authRateLimit = rateLimit({
  windowMs: config.authRateLimitWindowMs,
  limit: config.authRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: 'AUTH_RATE_LIMITED', error: 'Troppi tentativi. Riprova piu tardi' },
});
