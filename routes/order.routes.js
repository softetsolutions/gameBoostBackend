import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import { createPayPalOrder, capturePayPalOrder, getAllOrders, getOrdersByBuyerId, getOrderById, deleteOrder, getOrdersBySellerId,updateOrder,getOrderCountByStatus } from '../controllers/order.controller.js';

const router = express.Router();
router.post('/paypal/create', auth, createPayPalOrder);
router.post('/paypal/capture', auth, [
    body('offerId').notEmpty().withMessage('Offer ID is required'),
    body('offerId').isMongoId().withMessage('Invalid Offer ID format')
  ],
  validate, capturePayPalOrder );

router.get('/', auth, getAllOrders);
router.get('/buyer/:id', auth, getOrdersByBuyerId);
router.get('/:orderId', auth, getOrderById);
router.delete('/:orderId', auth, deleteOrder);
router.get('/seller/:id', auth, getOrdersBySellerId);
// router.put('/:orderId', auth, updateOrder);
// router.get('/count/status', auth, getOrderCountByStatus);

export default router;
