
import User from '../models/User.js';

export async function ensureInitialAdmin() {
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  // Admin seeding is optional when these settings are not configured.
  if (!name && !email && !password) {
    console.log('Initial admin seeding skipped: no admin credentials configured.');
    return;
  }

  if (!name || !email || !password) {
    throw new Error(
      'Initial admin configuration is incomplete. Set name, email, and password.'
    );
  }

  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error(
      'Initial admin password must be at least 8 characters and contain uppercase, lowercase, a number, and a symbol.'
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      throw new Error(
        'Initial admin email already belongs to a non-admin user. No role was changed.'
      );
    }

    console.log('Initial admin already exists.');
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin'
  });

  console.log('Initial admin account created.');
}
