import express from 'express';
import { conversationBetweenTwoUser, getConversationById } from '../controllers/conversation.controller.js';
const router = express.Router();

// Get conversation between two users
router.get('/between/:userId1/:userId2',conversationBetweenTwoUser );
router.get('/user/:userId',getConversationById );

export default router;
