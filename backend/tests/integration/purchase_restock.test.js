import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Vehicle from '../../src/models/Vehicle.js';

describe('Vehicles API - Purchase, Restock & Concurrency', () => {
  let userToken;
  let adminToken;

  beforeEach(async () => {
    // User
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Buyer Bob',
      email: 'buyer@example.com',
      password: 'Password123!'
    });
    userToken = userRes.body.token;

    // Admin
    const admin = new User({
      name: 'Dealership Boss',
      email: 'boss@dealership.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    await admin.save();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'boss@dealership.com',
      password: 'AdminPassword123!'
    });
    adminToken = adminLogin.body.token;
  });

  describe('POST /api/vehicles/:id/purchase (Stock rules)', () => {
    it('should successfully purchase a vehicle when stock is available and decrease quantity by 1', async () => {
      const vehicle = await Vehicle.create({
        make: 'Mazda',
        model: 'CX-5',
        category: 'SUV',
        price: 31000,
        quantity: 3
      });

      const response = await request(app)
        .post(`/api/vehicles/${vehicle._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vehicle');
      expect(response.body.vehicle.quantity).toBe(2);
      expect(response.body.message).toMatch(/purchase successful/i);

      // Verify in database
      const dbVehicle = await Vehicle.findById(vehicle._id);
      expect(dbVehicle.quantity).toBe(2);
    });

    it('should reject purchase with 400 Bad Request when stock is zero and leave stock unchanged', async () => {
      const vehicle = await Vehicle.create({
        make: 'Nissan',
        model: 'Altima',
        category: 'Sedan',
        price: 24000,
        quantity: 0
      });

      const response = await request(app)
        .post(`/api/vehicles/${vehicle._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/out of stock/i);

      // Verify stock remained 0
      const dbVehicle = await Vehicle.findById(vehicle._id);
      expect(dbVehicle.quantity).toBe(0);
    });

    it('should reject unauthenticated purchase with 401 Unauthorized', async () => {
      const vehicle = await Vehicle.create({
        make: 'Honda',
        model: 'Accord',
        category: 'Sedan',
        price: 28000,
        quantity: 1
      });

      const response = await request(app).post(`/api/vehicles/${vehicle._id}/purchase`);
      expect(response.status).toBe(401);
    });

    it('should return 404 for purchasing a non-existent vehicle ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/vehicles/${nonExistentId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Concurrency Safety - Simultaneous Purchase Attempts', () => {
    it('should handle concurrent purchase attempts atomically: exactly 1 succeeds on last vehicle, 9 fail, and stock never drops below 0', async () => {
      const vehicle = await Vehicle.create({
        make: 'Porsche',
        model: '911 Carrera',
        category: 'Coupe',
        price: 115000,
        quantity: 1 // Only 1 in stock!
      });

      // Fire 10 parallel purchase requests simultaneously
      const purchasePromises = Array.from({ length: 10 }).map(() =>
        request(app)
          .post(`/api/vehicles/${vehicle._id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`)
      );

      const results = await Promise.all(purchasePromises);

      const successes = results.filter(r => r.status === 200);
      const failures = results.filter(r => r.status === 400);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(9);

      // Check database: stock MUST be 0 and never negative
      const dbVehicle = await Vehicle.findById(vehicle._id);
      expect(dbVehicle.quantity).toBe(0);
    });
  });

  describe('POST /api/vehicles/:id/restock (Admin restocking)', () => {
    let vehicle;

    beforeEach(async () => {
      vehicle = await Vehicle.create({
        make: 'Subaru',
        model: 'Outback',
        category: 'SUV',
        price: 29000,
        quantity: 2
      });
    });

    it('should allow admin to restock vehicle with valid positive integer quantity', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.vehicle.quantity).toBe(7); // 2 + 5 = 7
      expect(response.body.message).toMatch(/restocked successfully/i);

      // Check database
      const dbVehicle = await Vehicle.findById(vehicle._id);
      expect(dbVehicle.quantity).toBe(7);
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(403);
    });

    it('should reject restock with zero, negative, or non-integer quantity with 400 Bad Request', async () => {
      const zeroRes = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 });
      expect(zeroRes.status).toBe(400);

      const negRes = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -3 });
      expect(negRes.status).toBe(400);

      const floatRes = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 2.7 });
      expect(floatRes.status).toBe(400);

      const missingRes = await request(app)
        .post(`/api/vehicles/${vehicle._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(missingRes.status).toBe(400);
    });

    it('should return 404 for restocking a non-existent vehicle ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/vehicles/${nonExistentId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(404);
    });
  });
});
