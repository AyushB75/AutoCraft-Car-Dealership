import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Vehicle from '../../src/models/Vehicle.js';
import { generateToken } from '../../src/services/authService.js';

describe('Security and validation regressions', () => {
  let token;
  beforeEach(async () => {
    const admin = await User.create({ name: 'Test Admin', email: 'regression@example.test', password: 'Test-only-password!', role: 'admin' });
    token = generateToken(admin);
  });

  it('uses the explicitly configured JWT secret', () => {
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).not.toThrow();
  });

  it('rejects expired tokens', async () => {
    const expired = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
  });

  it('does not allow public registration to grant admin privileges', async () => {
    const result = await request(app).post('/api/auth/register').send({ name: 'Customer', email: 'customer@example.test', password: 'Test-only-password1!', role: 'admin' });
    expect(result.status).toBe(201);
    expect(result.body.user.role).toBe('user');
    expect((await request(app).post('/api/vehicles').set('Authorization', `Bearer ${result.body.token}`).send({})).status).toBe(403);
  });

  it.each([null, 12, {}, ['person@example.test']])('rejects non-string email %j without internal details', async email => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Test-only-password1!' });
    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty('stack');
  });

  it.each([null, true, '', [], {}])('rejects invalid numeric vehicle input %j', async value => {
    const res = await request(app).post('/api/vehicles').set('Authorization', `Bearer ${token}`).send({ make: 'Test', model: 'Car', category: 'SUV', price: value, quantity: value });
    expect(res.status).toBe(400);
  });

  it.each(['not-an-id', '123'])('handles invalid vehicle ID %s cleanly', async id => {
    const res = await request(app).get(`/api/vehicles/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid vehicle ID');
  });

  it('treats search metacharacters as literal characters', async () => {
    await Vehicle.create({ make: 'A[uto', model: 'Car', category: 'SUV', price: 10, quantity: 1 });
    const res = await request(app).get('/api/vehicles/search').query({ make: '[' });
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(1);
  });

  it.each([{ minPrice: 'bad' }, { minPrice: '-1' }, { minPrice: '20', maxPrice: '10' }, { 'make[x]': 'bad' }])('rejects malformed search %j', async query => {
    expect((await request(app).get('/api/vehicles/search').query(query)).status).toBe(400);
  });

  it('rejects unknown update fields and empty updates', async () => {
    const vehicle = await Vehicle.create({ make: 'Test', model: 'Car', category: 'SUV', price: 10, quantity: 1 });
    for (const body of [{}, { createdAt: '2000-01-01' }, { quantity: true }]) {
      expect((await request(app).put(`/api/vehicles/${vehicle.id}`).set('Authorization', `Bearer ${token}`).send(body)).status).toBe(400);
    }
  });

  it('reports database readiness and blocks requests when unavailable', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200);
    const { host, port, name } = mongoose.connection;
    await mongoose.disconnect();
    try {
      expect((await request(app).get('/api/health')).status).toBe(503);
      expect((await request(app).get('/api/vehicles')).status).toBe(503);
    } finally { await mongoose.connect(`mongodb://${host}:${port}/${name}`); }
  });

  it('conceals unexpected internal errors', async () => {
    const spy = jest.spyOn(Vehicle, 'find').mockImplementation(() => { throw new Error('private database detail'); });
    try {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Internal Server Error' });
    } finally { spy.mockRestore(); }
  });
});
