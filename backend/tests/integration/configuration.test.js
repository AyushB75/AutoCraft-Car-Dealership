import { jest } from '@jest/globals';
import { readConfig } from '../../src/config/environment.js';
import { adminInput } from '../../src/scripts/seedAdmin.js';
import { startServer } from '../../src/server.js';
import mongoose from 'mongoose';

describe('Configuration and startup', () => {
  it.each([undefined, '', 'short', 'your_jwt_secret_key_minimum_32_characters_long'])('refuses missing or placeholder JWT configuration', secret => {
    expect(() => readConfig({ JWT_SECRET: secret })).toThrow(/JWT_SECRET/);
  });
  it('requires explicit production database and origin configuration', () => {
    expect(() => readConfig({ NODE_ENV: 'production', JWT_SECRET: process.env.JWT_SECRET })).toThrow(/Production/);
  });
  it('validates duration and port', () => {
    expect(() => readConfig({ JWT_SECRET: process.env.JWT_SECRET, JWT_EXPIRES_IN: 'bad' })).toThrow(/duration/);
    expect(() => readConfig({ JWT_SECRET: process.env.JWT_SECRET, PORT: '-1' })).toThrow(/PORT/);
  });
  it('refuses missing, short, and legacy default admin passwords', () => {
    for (const password of [undefined, 'short', 'AdminSecurePassword123!']) {
      expect(() => adminInput({ INITIAL_ADMIN_PASSWORD: password })).toThrow(/INITIAL_ADMIN_PASSWORD/);
    }
  });
  it('refuses to start when database connection fails', async () => {
    const spy = jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('Unavailable'));
    try { await expect(startServer()).rejects.toThrow('Unavailable'); }
    finally { spy.mockRestore(); }
  });
});
