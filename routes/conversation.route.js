import express from "express";
import {
  conversationBetweenTwoUser,
  getConversationById,
} from "../controllers/conversation.controller.js";
import auth from "../middleware/auth.middleware.js";
const router = express.Router();

// Get conversation between two users
router.get("/between/:userId1/:userId2", auth, conversationBetweenTwoUser);
router.get("/user/:userId", auth, getConversationById);

export default router;
