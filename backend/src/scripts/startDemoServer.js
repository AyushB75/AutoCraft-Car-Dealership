import express from 'express';
import cors from 'cors';

// Legacy mock: no persistence, real authentication, or complete admin API.
// Never use this server as assessment verification evidence.
if (process.env.NODE_ENV === 'production') throw new Error('The mock demo server is disabled in production.');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let sampleVehicles = [
  { id: '1', make: 'Toyota', model: 'Camry Hybrid', category: 'Sedan', price: 28855, quantity: 8 },
  { id: '2', make: 'Honda', model: 'CR-V EX-L', category: 'SUV', price: 34760, quantity: 5 },
  { id: '3', make: 'Tesla', model: 'Model 3 Long Range', category: 'Electric', price: 47490, quantity: 4 },
  { id: '4', make: 'Ford', model: 'F-150 Lightning', category: 'Electric', price: 54995, quantity: 2 },
  { id: '5', make: 'BMW', model: 'M340i xDrive', category: 'Sedan', price: 58400, quantity: 2 },
  { id: '6', make: 'Porsche', model: '911 Carrera', category: 'Coupe', price: 114400, quantity: 1 },
  { id: '7', make: 'Chevrolet', model: 'Corvette Stingray', category: 'Coupe', price: 68300, quantity: 0 }, // Out of stock demo
  { id: '8', make: 'Hyundai', model: 'Ioniq 5 Limited', category: 'Electric', price: 53500, quantity: 6 },
  { id: '9', make: 'Jeep', model: 'Grand Cherokee', category: 'SUV', price: 42130, quantity: 4 }
];

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.get('/api/vehicles', (req, res) => {
  res.json({ vehicles: sampleVehicles });
});

app.get('/api/vehicles/search', (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  let results = [...sampleVehicles];

  if (make) results = results.filter(v => v.make.toLowerCase().includes(make.toLowerCase()));
  if (model) results = results.filter(v => v.model.toLowerCase().includes(model.toLowerCase()));
  if (category && category !== 'All') results = results.filter(v => v.category.toLowerCase() === category.toLowerCase());
  if (minPrice) results = results.filter(v => v.price >= Number(minPrice));
  if (maxPrice) results = results.filter(v => v.price <= Number(maxPrice));

  res.json({ vehicles: results });
});

app.post('/api/vehicles/:id/purchase', (req, res) => {
  const vehicle = sampleVehicles.find(v => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  if (vehicle.quantity <= 0) return res.status(400).json({ message: 'Vehicle is out of stock' });
  vehicle.quantity -= 1;
  res.json({ message: 'Vehicle purchase successful', vehicle });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login successful',
    token: 'demo-admin-jwt-token',
    user: { id: 'admin-1', name: 'Dealership Admin', email: 'admin@dealership.com', role: 'admin' }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: { id: 'admin-1', name: 'Dealership Admin', email: 'admin@dealership.com', role: 'admin' }
  });
});

const server = app.listen(5001, '127.0.0.1', () => {
  console.log('MOCK ONLY: insecure, non-persistent demo on http://127.0.0.1:5001. Not the assessment backend.');
});

export default server;
