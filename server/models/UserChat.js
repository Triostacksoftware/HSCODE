import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const userChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants are unique and sorted
userChatSchema.pre("save", function (next) {
  if (this.participants.length === 2) {
    this.participants.sort();
  }
  next();
});

// Index for efficient queries
userChatSchema.index({ participants: 1 });
userChatSchema.index({ "lastMessageAt": -1 });
userChatSchema.index({ "unreadCount": 1 });

// Virtual for getting the other participant
userChatSchema.virtual("otherParticipant").get(function (userId) {
  if (!userId) return null;
  return this.participants.find(p => p.toString() !== userId.toString());
});

// Method to get unread count for a specific user
userChatSchema.methods.getUnreadCount = function (userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Method to increment unread count for a specific user
userChatSchema.methods.incrementUnreadCount = function (userId) {
  const currentCount = this.getUnreadCount(userId);
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to mark messages as read for a specific user
userChatSchema.methods.markAsRead = function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  this.lastMessageAt = new Date();
  return this.save();
};

const UserChatModel = mongoose.model("UserChat", userChatSchema);
const MessageModel = mongoose.model("Message", messageSchema);

export { UserChatModel, MessageModel };
export default UserChatModel;
