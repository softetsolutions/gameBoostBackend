import express from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
} from '../controllers/offer.controller.js';

const validateOffers = [
  body('product').notEmpty().withMessage('Product is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('quantityAvailable').optional().isInt({ min: 1 }).withMessage('Quantity available must be a positive integer'),
  body('deliveryTime').notEmpty().withMessage('Delivery time is required'),
  body('status').optional().isIn(['active', 'inactive', 'soldout'])    
  .withMessage('Status must be active, inactive, or soldout'),
  body('offerDetails').optional().isArray().withMessage('Offer details must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
];


const router = express.Router();

router.post('/', auth, checkRole('seller'),validateOffers, validate, createOffer);
router.get('/', getAllOffers);
router.get('/:id',auth, getOfferById);
router.put('/:id', auth, checkRole('seller'),validateOffers, validate, updateOffer);
router.delete('/:id', auth, checkRole('seller'), deleteOffer);

export default router;
