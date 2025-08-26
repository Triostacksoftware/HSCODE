import express from "express";
import {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  getUnreadCount,
  markChatAsRead,
  getChatById,
} from "../controllers/userChat.ctrls.js";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import { premiumMembership } from "../middlewares/membership.mdware.js";

const router = express.Router();

// All routes require authentication and premium membership
router.use(authMiddleware);
router.use(premiumMembership);

// Create or get existing chat
router.post("/create", getOrCreateChat);

// Get all chats for the authenticated user
router.get("/", getUserChats);

// Get a single chat by ID
router.get("/:chatId", getChatById);

// Get messages for a specific chat
router.get("/:chatId/messages", getChatMessages);

// Send a message in a chat
router.post("/:chatId/message", sendMessage);

// Mark chat as read
router.patch("/:chatId/read", markChatAsRead);

// Get total unread count
router.get("/unread/count", getUnreadCount);

export default router;
