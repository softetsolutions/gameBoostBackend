import express from 'express';
import {
  getSocialConnectStatus,
  linkSocialAccount,
  unlinkSocialAccount
} from '../controllers/socialConnect.controller.js';

const router = express.Router();

router.get('/:accountId', getSocialConnectStatus);
router.put('/:accountId/link', linkSocialAccount);
router.put('/:accountId/unlink', unlinkSocialAccount);

export default router;
