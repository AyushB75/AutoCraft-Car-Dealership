import { randomBytes } from 'node:crypto';

// Test credentials are generated for this process; never load private local .env values.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.JWT_EXPIRES_IN = '1h';
