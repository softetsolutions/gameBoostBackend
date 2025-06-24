import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { getAccountDetails, updateAccountDetails } from '../controllers/account.controller.js';

const router = express.Router();

router.get('/', auth, getAccountDetails);
router.put('/update', auth, updateAccountDetails);

export default router;