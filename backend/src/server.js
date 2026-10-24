import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_dealership';

async function startServer() {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('Connected to MongoDB database successfully');
    }
  } catch (error) {
    console.warn('MongoDB connection warning:', error.message);
    console.warn('Server starting in offline-DB mode. Run MongoDB or update MONGODB_URI in .env');
  }

  const server = app.listen(PORT, () => {
    console.log(`Car Dealership Backend running on http://localhost:${PORT}`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };
