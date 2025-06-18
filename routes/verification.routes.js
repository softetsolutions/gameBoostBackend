import express from 'express';
import {
  getUserVerificationStatus,
  updateUserVerificationStatus,
} from '../controllers/verification.controller.js';

const router = express.Router();

router.get('/:accountId/status', getUserVerificationStatus);
router.put('/:accountId/update', updateUserVerificationStatus);

export default router;
