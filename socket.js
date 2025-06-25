import Conversation from "./models/conversation.model.js";

const getUserRole = (conversation, userId) => {
  if (conversation.participants.user1.toString() === userId) return "user1";
  if (conversation.participants.user2.toString() === userId) return "user2";
  return null;
};

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        let conversation = await Conversation.findOne({
          $or: [
            {
              "participants.user1": senderId,
              "participants.user2": receiverId,
            },
            {
              "participants.user1": receiverId,
              "participants.user2": senderId,
            },
          ],
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: { user1: senderId, user2: receiverId },
            messages: [],
          });
        }

        const role = getUserRole(conversation, senderId);
        conversation.messages.push({ user: role, text });
        await conversation.save();

        io.to(receiverId).emit("receiveMessage", { text });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("markAsRead", async ({ conversationId, userId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const userRole = getUserRole(conversation, userId);
        if (!userRole) return;

        const otherRole = userRole === "user1" ? "user2" : "user1";

        let updated = false;
        conversation.messages.forEach((msg) => {
          if (msg.user === otherRole && !msg.read) {
            msg.read = true;
            updated = true;
          }
        });

        if (updated) {
          conversation.markModified("messages");
          await conversation.save();
        }
      } catch (err) {
        console.error("Error in markAsRead:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}
