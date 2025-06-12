import express from 'express';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import {
  createAccount,
  getAccount,
  getAccountById,
  updateAccount,
  deleteAccount
} from '../controllers/account.controller.js';

const router = express.Router();


const validateAccount = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('nationalIdentityNumber')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Invalid national identity number'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
  body('instantMessengers').optional().isArray().withMessage('instantMessengers must be an array'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('billingAddress.addressLine1').notEmpty().withMessage('Address Line 1 is required'),
  body('billingAddress.city').notEmpty().withMessage('City is required'),
  body('billingAddress.state').notEmpty().withMessage('State is required'),
  body('billingAddress.zipCode')
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Invalid zip code'),
  body('billingAddress.country').notEmpty().withMessage('Country is required'),
  body('taxRegistrationNumber.countryCode').optional().isLength({ max: 2 }).withMessage('Invalid country code'),
  body('taxRegistrationNumber.number')
    .optional()
    .matches(/^[A-Za-z0-9]{10,20}$/)
    .withMessage('Invalid tax registration number'),
];

router.get('/', getAccount);
router.get('/:_id', getAccountById);
router.post('/', validateAccount, validate, createAccount);
router.put('/:id', validateAccount, validate, updateAccount);
router.delete('/:id', deleteAccount);

export default router;
