import { config } from './config/environment.js';
import mongoose from 'mongoose';
import { ensureInitialAdmin } from './services/adminSeedService.js';
import { pathToFileURL } from 'node:url';
import app from './app.js';

export async function startServer() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await ensureInitialAdmin();
  try {
    const server = await new Promise((resolve, reject) => {
      const listener = app.listen(config.port, '127.0.0.1', () => resolve(listener));
      listener.once('error', reject);
    });
    console.log(`Car Dealership Backend ready on http://127.0.0.1:${config.port}`);
    return server;
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().then(server => {
    const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  }).catch(() => {
    console.error('Backend startup failed. Check database availability and environment configuration.');
    process.exitCode = 1;
  });
}
