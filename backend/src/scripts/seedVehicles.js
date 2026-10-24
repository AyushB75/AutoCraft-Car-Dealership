import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_dealership';

const sampleVehicles = [
  { make: 'Toyota', model: 'Camry Hybrid', category: 'Sedan', price: 28855, quantity: 8 },
  { make: 'Honda', model: 'CR-V EX-L', category: 'SUV', price: 34760, quantity: 5 },
  { make: 'Tesla', model: 'Model 3 Long Range', category: 'Electric', price: 47490, quantity: 4 },
  { make: 'Ford', model: 'F-150 Lightning', category: 'Electric', price: 54995, quantity: 3 },
  { make: 'BMW', model: 'M340i xDrive', category: 'Sedan', price: 58400, quantity: 2 },
  { make: 'Porsche', model: '911 Carrera', category: 'Coupe', price: 114400, quantity: 1 },
  { make: 'Hyundai', model: 'Ioniq 5 Limited', category: 'Electric', price: 53500, quantity: 6 },
  { make: 'Chevrolet', model: 'Corvette Stingray', category: 'Coupe', price: 68300, quantity: 0 }, // Out of stock example!
  { make: 'Jeep', model: 'Grand Cherokee', category: 'SUV', price: 42130, quantity: 4 },
  { make: 'Volkswagen', model: 'Golf GTI', category: 'Hatchback', price: 31965, quantity: 3 }
];

async function seedVehicles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database');

    const count = await Vehicle.countDocuments();
    if (count > 0) {
      console.log(`Database already contains ${count} vehicles. Skipping seeding.`);
      process.exit(0);
    }

    await Vehicle.insertMany(sampleVehicles);
    console.log(`Successfully seeded ${sampleVehicles.length} demo vehicles into catalog.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vehicles:', error.message);
    process.exit(1);
  }
}

seedVehicles();
