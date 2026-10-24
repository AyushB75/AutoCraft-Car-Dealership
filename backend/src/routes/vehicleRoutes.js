import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/search', vehicleController.searchVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), vehicleController.createVehicle);
router.put('/:id', authenticate, requireRole('admin'), vehicleController.updateVehicle);
router.delete('/:id', authenticate, requireRole('admin'), vehicleController.deleteVehicle);

export default router;
