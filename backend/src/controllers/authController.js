import * as authService from '../services/authService.js';
import { authInput } from '../validators/input.js';


export const register = async (req, res, next) => {
  try {
    const { name, email, password } = authInput(req.body, true);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol'
      });
    }

    const result = await authService.registerUser({
      name,
      email,
      password
    });

    return res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = authInput(req.body);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    return res.status(200).json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
