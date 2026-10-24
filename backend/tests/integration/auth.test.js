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
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it('should reject registration with 409 Conflict if email is already registered', async () => {
    const userData = {
      name: 'Existing User',
      email: 'duplicate@example.com',
      password: 'Password123!'
    };

    // First registration
    await request(app).post('/api/auth/register').send(userData);

    // Duplicate registration attempt (with different casing/whitespace)
    const duplicateResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Name',
        email: '  DUPLICATE@example.com ',
        password: 'DifferentPassword456!'
      });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toMatch(/already exists/i);
  });

  it('should reject registration with 400 Bad Request when required fields are missing or invalid', async () => {
    // Missing name
    const resNoName = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'Password123!'
    });
    expect(resNoName.status).toBe(400);

    // Invalid email format
    const resBadEmail = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'Password123!'
    });
    expect(resBadEmail.status).toBe(400);

    // Password too short (< 6 chars)
    const resShortPass = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'valid@example.com',
      password: '123'
    });
    expect(resShortPass.status).toBe(400);
  });
});

describe('Auth API - User Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'ValidPassword123!'
    });
  });

  it('should authenticate user and return token and user profile on valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'ValidPassword123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('login@example.com');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should reject login with 401 Unauthorized for invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'WrongPassword123!'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it('should reject login with 401 Unauthorized for non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'ValidPassword123!'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it('should reject login with 400 Bad Request for missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com' });

    expect(response.status).toBe(400);
  });
});

describe('Auth Middleware & Protected Routes', () => {
  let userToken;
  let adminToken;

  beforeEach(async () => {
    // Create standard user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!'
    });
    userToken = userRes.body.token;

    // Create admin user directly
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    await admin.save();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminPassword123!'
    });
    adminToken = adminLogin.body.token;
  });

  it('should return current user profile on GET /api/auth/me with valid Bearer token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('user@example.com');
    expect(response.body.user.role).toBe('user');
  });

  it('should reject GET /api/auth/me with 401 Unauthorized when token is missing', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('should reject GET /api/auth/me with 401 Unauthorized when token is invalid or malformed', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');

    expect(response.status).toBe(401);
  });
});
