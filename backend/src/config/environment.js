import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Resolve against this module, not the caller's working directory. Tests supply their own environment.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
}

export function readConfig(env = process.env) {
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32 || /^(your_|replace|change)/i.test(secret)) {
    throw new Error('Set JWT_SECRET to a unique random value of at least 32 characters.');
  }
  if (env.NODE_ENV === 'production' && (!env.MONGODB_URI || !env.CLIENT_URL)) {
    throw new Error('Production requires MONGODB_URI and CLIENT_URL.');
  }
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
  const expiresIn = env.JWT_EXPIRES_IN || '24h';
  if (!/^\d+(ms|s|m|h|d|w|y)$/.test(expiresIn)) throw new Error('JWT_EXPIRES_IN must include a duration unit, for example 24h.');
  return { jwtSecret: secret, jwtExpiresIn: expiresIn, port, mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_dealership', clientUrl: env.CLIENT_URL || 'http://localhost:5173' };
}

export const config = readConfig();
