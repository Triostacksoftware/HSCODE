import { UserChatModel, MessageModel } from "../models/UserChat.js";
import UserModel from "../models/user.js";

// Get a single chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await UserChatModel.findById(chatId)
      .populate("participants", "name email image role membership")
      .populate("lastMessage", "content createdAt senderId")
      .populate("lastMessage.senderId", "name image");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (
      !chat.participants.some((p) => p._id.toString() === userId.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get the other participant
    const otherUser = chat.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    // Get recent messages
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId, receiverId: otherUser._id },
        { senderId: otherUser._id, receiverId: userId },
      ],
    })
      .populate("senderId", "name image")
      .populate("receiverId", "name image")
      .sort({ createdAt: 1 })
      .limit(50);

    const chatWithMessages = {
      ...chat.toObject(),
      otherUser,
      messages,
    };

    res.json({
      success: true,
      chat: chatWithMessages,
    });
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get or create a chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check if chat already exists
    let chat = await UserChatModel.findOne({
      participants: { $all: [currentUserId, otherUserId] },
      isActive: true,
    }).populate("participants", "name email image countryCode");

    if (!chat) {
      // Create new chat
      chat = new UserChatModel({
        participants: [currentUserId, otherUserId],
        unreadCount: new Map([[otherUserId.toString(), 0]]),
      });
      await chat.save();

      // Populate participants
      chat = await chat.populate(
        "participants",
        "name email image countryCode"
      );
    }

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        unreadCount: chat.getUnreadCount(currentUserId),
      },
    });
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all chats for current user
export const getUserChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const chats = await UserChatModel.find({
      participants: currentUserId,
      isActive: true,
    })
      .populate("participants", "name email image countryCode")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== currentUserId
      );

      return {
        _id: chat._id,
        otherUser: otherParticipant,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        unreadCount: chat.getUnreadCount(currentUserId),
      };
    });

    res.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    // Verify user is part of this chat
    const chat = await UserChatModel.findOne({
      _id: chatId,
      participants: currentUserId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get messages
    const messages = await MessageModel.find({
      $or: [
        { senderId: currentUserId, receiverId: { $in: chat.participants } },
        { receiverId: currentUserId, senderId: { $in: chat.participants } },
      ],
    })
      .populate("senderId", "name image")
      .populate("receiverId", "name image")
      .sort({ createdAt: 1 });

    // Mark messages as read for current user
    await MessageModel.updateMany(
      {
        receiverId: currentUserId,
        senderId: { $in: chat.participants },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update chat unread count
    await chat.markAsRead(currentUserId);

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { content, messageType = "text" } = req.body;
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    if (!content || !chatId) {
      return res
        .status(400)
        .json({ message: "Content and chat ID are required" });
    }

    // Verify user is part of this chat
    const chat = await UserChatModel.findOne({
      _id: chatId,
      participants: currentUserId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get the other participant
    const otherParticipant = chat.participants.find(
      (p) => p.toString() !== currentUserId
    );

    // Create message
    const message = new MessageModel({
      senderId: currentUserId,
      receiverId: otherParticipant,
      content,
      messageType,
    });

    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.incrementUnreadCount(otherParticipant);

    // Populate sender info
    await message.populate("senderId", "name image");

    res.json({
      success: true,
      message: {
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        senderId: message.senderId,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
        isRead: message.isRead,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send an image message
export const sendImageMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Verify user is part of this chat
    const chat = await UserChatModel.findOne({
      _id: chatId,
      participants: currentUserId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get the other participant
    const otherParticipant = chat.participants.find(
      (p) => p.toString() !== currentUserId
    );

    // Create image message
    const message = new MessageModel({
      senderId: currentUserId,
      receiverId: otherParticipant,
      content: caption || "📷 Image",
      messageType: "image",
      fileUrl: `/upload/${req.file.filename}`,
      fileName: req.file.originalname,
    });

    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.incrementUnreadCount(otherParticipant);

    // Populate sender info
    await message.populate("senderId", "name image");

    res.json({
      success: true,
      message: {
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        senderId: message.senderId,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
        isRead: message.isRead,
      },
    });
  } catch (error) {
    console.error("Error sending image message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread message count for current user
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const totalUnread = await UserChatModel.aggregate([
      {
        $match: {
          participants: currentUserId,
          isActive: true,
        },
      },
      {
        $project: {
          unreadCount: {
            $ifNull: [
              {
                $toInt: {
                  $getField: { field: "unreadCount", input: "$unreadCount" },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUnread: { $sum: "$unreadCount" },
        },
      },
    ]);

    const count = totalUnread[0]?.totalUnread || 0;

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    const chat = await UserChatModel.findOne({
      _id: chatId,
      participants: currentUserId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark messages as read
    await MessageModel.updateMany(
      {
        receiverId: currentUserId,
        senderId: { $in: chat.participants },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update chat unread count
    await chat.markAsRead(currentUserId);

    res.json({
      success: true,
      message: "Chat marked as read",
    });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
