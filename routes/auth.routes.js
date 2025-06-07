import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 chars password'),
    body('role').isIn(['buyer', 'seller']).withMessage('Invalid role')
  ],
  validate, register);
router.post('/login',[
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate, login);

export default router;
