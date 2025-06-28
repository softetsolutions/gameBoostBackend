import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String, // 'user1' or 'user2'
      required: true,
      enum: ["user1", "user2"],
    },
    text: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
