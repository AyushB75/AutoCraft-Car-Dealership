import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Vehicle from '../../src/models/Vehicle.js';

describe('Vehicles API - CRUD & Search', () => {
  let userToken;
  let adminToken;

  beforeEach(async () => {
    // Register normal user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Regular Customer',
      email: 'customer@example.com',
      password: 'Password123!'
    });
    userToken = userRes.body.token;

    // Create admin user
    const admin = new User({
      name: 'Admin Manager',
      email: 'admin_mgr@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    await admin.save();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin_mgr@example.com',
      password: 'AdminPassword123!'
    });
    adminToken = adminLogin.body.token;
  });

  describe('POST /api/vehicles (Add vehicle)', () => {
    const validVehicle = {
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: 26000,
      quantity: 5
    };

    it('should allow admin to create a vehicle successfully', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validVehicle);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('vehicle');
      expect(response.body.vehicle).toMatchObject({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 26000,
        quantity: 5
      });
      expect(response.body.vehicle).toHaveProperty('id');

      // Verify in DB
      const dbVehicle = await Vehicle.findById(response.body.vehicle.id);
      expect(dbVehicle).not.toBeNull();
      expect(dbVehicle.model).toBe('Camry');
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);

      expect(response.status).toBe(403);
    });

    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send(validVehicle);

      expect(response.status).toBe(401);
    });

    it('should reject vehicle with negative price with 400 Bad Request', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validVehicle, price: -500 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/price/i);
    });

    it('should reject vehicle with negative or non-integer quantity with 400 Bad Request', async () => {
      const negQuantityRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validVehicle, quantity: -2 });

      expect(negQuantityRes.status).toBe(400);

      const floatQuantityRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validVehicle, quantity: 3.5 });

      expect(floatQuantityRes.status).toBe(400);
    });

    it('should reject vehicle with missing required fields with 400 Bad Request', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ make: 'Honda' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/vehicles (List vehicles)', () => {
    beforeEach(async () => {
      await Vehicle.create([
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 24000, quantity: 4 },
        { make: 'Ford', model: 'Explorer', category: 'SUV', price: 38000, quantity: 2 }
      ]);
    });

    it('should list all vehicles', async () => {
      const response = await request(app).get('/api/vehicles');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vehicles');
      expect(Array.isArray(response.body.vehicles)).toBe(true);
      expect(response.body.vehicles.length).toBe(2);
      expect(response.body.vehicles[0]).toHaveProperty('id');
      expect(response.body.vehicles[0]).toHaveProperty('make');
    });
  });

  describe('GET /api/vehicles/search (Search & Filtering)', () => {
    beforeEach(async () => {
      await Vehicle.create([
        { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 40000, quantity: 3 },
        { make: 'Tesla', model: 'Model Y', category: 'Electric', price: 48000, quantity: 2 },
        { make: 'BMW', model: 'X5', category: 'SUV', price: 65000, quantity: 1 },
        { make: 'Honda', model: 'CR-V', category: 'SUV', price: 32000, quantity: 6 },
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 }
      ]);
    });

    it('should filter by make (case-insensitive substring)', async () => {
      const response = await request(app).get('/api/vehicles/search?make=tes');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(2);
      expect(response.body.vehicles.every(v => v.make === 'Tesla')).toBe(true);
    });

    it('should filter by model (case-insensitive substring)', async () => {
      const response = await request(app).get('/api/vehicles/search?model=cor');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(1);
      expect(response.body.vehicles[0].model).toBe('Corolla');
    });

    it('should filter by category', async () => {
      const response = await request(app).get('/api/vehicles/search?category=SUV');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(2);
      expect(response.body.vehicles.every(v => v.category === 'SUV')).toBe(true);
    });

    it('should filter by price range (minPrice and maxPrice)', async () => {
      const response = await request(app).get('/api/vehicles/search?minPrice=30000&maxPrice=45000');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(2); // Tesla Model 3 (40000) and Honda CR-V (32000)
      expect(response.body.vehicles.every(v => v.price >= 30000 && v.price <= 45000)).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const response = await request(app).get('/api/vehicles/search?category=SUV&maxPrice=40000');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(1);
      expect(response.body.vehicles[0].model).toBe('CR-V');
    });

    it('should return empty list when no vehicles match criteria', async () => {
      const response = await request(app).get('/api/vehicles/search?make=Ferrari');
      expect(response.status).toBe(200);
      expect(response.body.vehicles.length).toBe(0);
    });
  });

  describe('PUT /api/vehicles/:id (Update vehicle)', () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        make: 'Hyundai',
        model: 'Elantra',
        category: 'Sedan',
        price: 21000,
        quantity: 3
      });
      vehicleId = vehicle._id.toString();
    });

    it('should allow admin to update vehicle price and model', async () => {
      const response = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 22500, model: 'Elantra Hybrid' });

      expect(response.status).toBe(200);
      expect(response.body.vehicle.price).toBe(22500);
      expect(response.body.vehicle.model).toBe('Elantra Hybrid');
    });

    it('should reject non-admin with 403 Forbidden', async () => {
      const response = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 25000 });

      expect(response.status).toBe(403);
    });

    it('should reject negative price update with 400 Bad Request', async () => {
      const response = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: -100 });

      expect(response.status).toBe(400);
    });

    it('should return 404 Not Found for non-existent vehicle ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/vehicles/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 25000 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id (Delete vehicle)', () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        make: 'Chevrolet',
        model: 'Malibu',
        category: 'Sedan',
        price: 25000,
        quantity: 2
      });
      vehicleId = vehicle._id.toString();
    });

    it('should allow admin to delete vehicle', async () => {
      const response = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted successfully/i);

      const dbCheck = await Vehicle.findById(vehicleId);
      expect(dbCheck).toBeNull();
    });

    it('should reject non-admin with 403 Forbidden', async () => {
      const response = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 Not Found for non-existent vehicle ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/vehicles/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
