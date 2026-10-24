import * as vehicleService from '../services/vehicleService.js';

export const createVehicle = async (req, res, next) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: 'Make, model, category, price, and quantity are required.'
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative.' });
    }

    if (quantity < 0 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }

    const vehicle = await vehicleService.createVehicle({
      make,
      model,
      category,
      price: Number(price),
      quantity: Number(quantity)
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getVehicles();
    res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
};

export const searchVehicles = async (req, res, next) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const vehicles = await vehicleService.searchVehicles({
      make,
      model,
      category,
      minPrice,
      maxPrice
    });
    res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const purchaseVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.purchaseVehicle(req.params.id);
    res.status(200).json({
      message: 'Vehicle purchase successful',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

export const restockVehicle = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const vehicle = await vehicleService.restockVehicle(req.params.id, quantity);
    res.status(200).json({
      message: 'Vehicle restocked successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};
