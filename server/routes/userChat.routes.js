import express from "express";
import {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  sendImageMessage,
  getUnreadCount,
  markChatAsRead,
  getChatById,
} from "../controllers/userChat.ctrls.js";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import { premiumMembership } from "../middlewares/membership.mdware.js";
import upload from "../configurations/multer.js";

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

// Send an image message in a chat
router.post("/:chatId/image", upload.single("image"), sendImageMessage);

// Mark chat as read
router.patch("/:chatId/read", markChatAsRead);

// Get total unread count
router.get("/unread/count", getUnreadCount);

export default router;
