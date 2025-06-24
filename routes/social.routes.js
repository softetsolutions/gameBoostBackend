import express from 'express';
import { getSocialConnectStatus,unlinkSocialAccount } from '../controllers/social.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();
// Get social connection status
router.get('/status', auth, getSocialConnectStatus);
// Unlink a social account
router.post('/unlink', auth, unlinkSocialAccount);

export default router;