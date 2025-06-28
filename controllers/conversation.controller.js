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
      return res.status(404).json({success:false, message: "No conversation found" });

    res.status(200).json({success:true,data:conversation});
  } catch (err) {
    next(err);
  }
};

export const getConversationById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      $or: [{ "participants.user1": userId }, { "participants.user2": userId }],
    })
      .populate("participants.user1 participants.user2", "displayName")
      .then((convs) =>
        convs.filter((c) => c.participants.user1 && c.participants.user2)
      );
    const formattedConversations = conversations.map((conv) => {
      const { user1, user2 } = conv.participants;

      const currentUserKey =
        user1._id.toString() === userId ? "user1" : "user2";
      const otherUserKey = currentUserKey === "user1" ? "user2" : "user1";
      const otherUser = conv.participants[otherUserKey];

      const sortedMessages = [...conv.messages];
      const lastMessage = sortedMessages[sortedMessages.length - 1] || null;

      const unreadCount = conv.messages.filter(
        (msg) => msg.user === otherUserKey && msg.read === false
      ).length;

      return {
        userId: otherUser._id,
        displayName: otherUser.displayName,
        unreadCount,
        lastMessage: lastMessage.text,
        timestamp: lastMessage.timestamp,
      };
    });
    res.status(200).json({ success: true, data: formattedConversations });
  } catch (err) {
    next(err);
  }
};
