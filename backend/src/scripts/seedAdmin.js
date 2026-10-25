import { config } from '../config/environment.js';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import User from '../models/User.js';
import { authInput } from '../validators/input.js';

export function adminInput(env = process.env) {
  const password = env.INITIAL_ADMIN_PASSWORD;
  if (!password || password.length < 12 || /^(your|replace|change|AdminSecurePassword)/i.test(password)) {
    throw new Error('Set INITIAL_ADMIN_PASSWORD to a unique password of at least 12 characters.');
  }
  return authInput({ name: env.INITIAL_ADMIN_NAME || 'Admin User', email: env.INITIAL_ADMIN_EMAIL, password }, true);
}

export async function seedAdmin() {
  const input = adminInput();
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      if (existing.role !== 'admin') throw new Error('Account already exists as a customer. Automatic promotion is refused.');
      console.log('Administrator already exists; credentials were not changed.');
      return;
    }
    await User.create({ ...input, role: 'admin' });
    console.log('Initial administrator created.');
  } finally { await mongoose.disconnect(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedAdmin().catch(() => {
    console.error('Admin setup failed. Check explicit admin credentials and database availability; no automatic customer promotion is allowed.');
    process.exitCode = 1;
  });
}
