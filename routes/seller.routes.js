import express from 'express';
import {
  createSellerRequest,
  getAllSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
} from '../controllers/seller.controller.js';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', auth, createSellerRequest); 
router.get('/', auth, checkRole('admin'), getAllSellerRequests); 
router.patch('/:id/approve', auth, checkRole('admin'), approveSellerRequest);
router.patch('/:id/reject', auth, checkRole('admin'), rejectSellerRequest);

export default router;
