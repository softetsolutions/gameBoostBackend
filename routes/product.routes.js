import express from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import {
  createProduct, getAllProducts, getProduct, updateProduct, deleteProduct,getProductsByServiceId
} from '../controllers/product.controller.js';

const validateProducts = [
    body('title').notEmpty().withMessage('Title is required'),
    body('dynamicFields').optional().isObject().withMessage('Dynamic fields must be an object')
  ];
const router = express.Router();
router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', auth, checkRole('seller'), validateProducts, validate, createProduct);
router.put('/:id', auth, checkRole('seller'), validateProducts, validate, updateProduct);
router.delete('/:id', auth, checkRole('seller'), deleteProduct);
router.get('/service/:serviceId',auth, getProductsByServiceId);
export default router;
