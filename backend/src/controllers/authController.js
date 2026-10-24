import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const result = await authService.registerUser({ name, email, password });
    return res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};
