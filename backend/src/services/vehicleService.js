import Vehicle from '../models/Vehicle.js';

export const createVehicle = async (vehicleData) => {
  const vehicle = new Vehicle(vehicleData);
  await vehicle.save();
  return vehicle.toJSON();
};

export const getVehicles = async () => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  return vehicles.map(v => v.toJSON());
};

export const searchVehicles = async ({ make, model, category, minPrice, maxPrice }) => {
  const query = {};

  if (make && make.trim()) {
    query.make = { $regex: make.trim(), $options: 'i' };
  }

  if (model && model.trim()) {
    query.model = { $regex: model.trim(), $options: 'i' };
  }

  if (category && category.trim()) {
    query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      const min = Number(minPrice);
      if (!isNaN(min)) query.price.$gte = min;
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = Number(maxPrice);
      if (!isNaN(max)) query.price.$lte = max;
    }
  }

  const vehicles = await Vehicle.find(query).sort({ price: 1 });
  return vehicles.map(v => v.toJSON());
};

export const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return vehicle.toJSON();
};

export const updateVehicle = async (id, updateData) => {
  // Validate non-negative numbers if passed
  if (updateData.price !== undefined && updateData.price < 0) {
    const error = new Error('Price cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  if (updateData.quantity !== undefined) {
    if (updateData.quantity < 0 || !Number.isInteger(Number(updateData.quantity))) {
      const error = new Error('Quantity must be a non-negative integer');
      error.statusCode = 400;
      throw error;
    }
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  return vehicle.toJSON();
};

export const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return { id, message: 'Vehicle deleted successfully' };
};
