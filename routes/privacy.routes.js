import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { toggleTwoFactor, updatePassword } from '../controllers/privacy.controller.js';

const router = express.Router();
// Toggle two-factor authentication
router.post('/toggle/2fa', auth, toggleTwoFactor);
// Update password
router.put('/update/password', auth, updatePassword);

export default router;