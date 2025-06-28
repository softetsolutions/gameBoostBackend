import express from 'express';
import { register, login,logout } from '../controllers/auth.controller.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.middleware.js';


const router = express.Router();
router.post('/register', [
    body('firstName').notEmpty().withMessage('firstName is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 chars password')
  ],
  validate, register);
router.post('/login',[
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate, login);

router.post('/logout', logout);
  
export default router;
