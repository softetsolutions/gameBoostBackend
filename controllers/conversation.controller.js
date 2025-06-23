import Conversation from "../models/conversation.model.js";

export const conversationBetweenTwoUser = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        { "participants.user1": userId1, "participants.user2": userId2 },
        { "participants.user1": userId2, "participants.user2": userId1 },
      ],
    });

    if (!conversation)
      return res.status(404).json({ message: "No conversation found" });

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      $or: [{ "participants.user1": userId }, { "participants.user2": userId }],
    });

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
