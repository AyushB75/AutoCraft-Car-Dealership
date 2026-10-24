import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth API - User Registration', () => {
  it('should register a new user successfully, return a token and sanitized user, and hash the password in the database', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');

    // Verify in database: password must be securely hashed and not plaintext
    const dbUser = await User.findOne({ email: 'john@example.com' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe('Password123!');
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
  });
});
