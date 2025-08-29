"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaPaperPlane,
  FaImage,
  FaTimes,
  FaFile,
} from "react-icons/fa";
import axios from "axios";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";
import { toast } from "react-hot-toast";

const IndividualUserChat = ({ chat, user, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState(false);
  const [otherUserMessageNotification, setOtherUserMessageNotification] =
    useState(null);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Document upload states
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentCaption, setDocumentCaption] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Image modal states
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { socket } = useContext(OnlineUsersContext);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Add body class to prevent page scrolling
  useEffect(() => {
    document.body.classList.add("chat-active");
    return () => {
      document.body.classList.remove("chat-active");
    };
  }, []);

  // Fetch messages when chat changes
  useEffect(() => {
    if (chat?._id) {
      fetchMessages();

      // Scroll to bottom when switching to a new chat
      setTimeout(() => {
        scrollToBottomImmediate();
      }, 200);

      // Clear unread count for this chat when opened
      if (chat.unreadCount > 0) {
        clearUnreadCount();
      }
    }
  }, [chat?._id]);

  // Clear unread count for the current chat
  const clearUnreadCount = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/read`,
        {},
        { withCredentials: true }
      );
      console.log("Unread count cleared for chat:", chat._id);
    } catch (error) {
      console.error("Error clearing unread count:", error);
    }
  };

  // Socket event handling
  useEffect(() => {
    if (socket && chat?._id) {
      console.log(`Joining user chat room: ${chat._id}`);

      // Join chat room
      socket.emit("join-user-chat", { chatId: chat._id });

      // Listen for new messages
      const handleNewMessageEvent = (data) => {
        console.log("Received new message event:", data);
        handleNewMessage(data);
      };

      // Listen for typing indicators
      const handleTypingEvent = (data) => {
        console.log("Received typing event:", data);
        if (data.chatId === chat._id && data.userId !== user._id) {
          setOtherUserTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      };

      socket.on("new-user-message", handleNewMessageEvent);
      socket.on("user-typing", handleTypingEvent);

      return () => {
        console.log(`Leaving user chat room: ${chat._id}`);
        socket.emit("leave-user-chat", { chatId: chat._id });
        socket.off("new-user-message", handleNewMessageEvent);
        socket.off("user-typing", handleTypingEvent);
      };
    }
  }, [socket, chat?._id, user._id]);

  // Listen for messages from other users while in this chat
  useEffect(() => {
    if (!socket || !user || !chat) return;

    const handleOtherUserMessage = (data) => {
      console.log("Message received while in chat:", data);

      // SIMPLE RULE: If you're in a chat with someone, don't show notifications from them
      const currentChatUserId = chat.otherUser?._id;
      const messageSenderId = data.sender?._id || data.senderId;

      // Don't show notification if message is from the user you're currently chatting with
      if (currentChatUserId === messageSenderId) {
        console.log("No notification - message from current chat user");
        return;
      }

      // Show notification for messages from other users
      console.log("Showing notification - message from different user");
      const senderName = data.sender?.name || data.senderName || "Someone";

      setOtherUserMessageNotification({
        senderName,
        messageContent: data.message?.content || "sent you a message",
        chatId: data.chatId,
        timestamp: new Date(),
      });

      // Auto-hide after 5 seconds
      setTimeout(() => setOtherUserMessageNotification(null), 5000);
    };

    socket.on("new-user-message", handleOtherUserMessage);
    return () => socket.off("new-user-message", handleOtherUserMessage);
  }, [socket, user, chat]);

  // Keyboard shortcuts for scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+End or Cmd+End to scroll to bottom
      if ((e.ctrlKey || e.metaKey) && e.key === "End") {
        e.preventDefault();
        scrollToBottomImmediate();
      }

      // Escape key to close image modal
      if (e.key === "Escape" && isImageModalOpen) {
        closeImageModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen]);

  // Add scroll event listener to messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Add delay to ensure DOM is fully updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const messagesContainer =
        messagesEndRef.current.closest(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  };

  // Enhanced scroll to bottom for new messages
  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      const messagesContainer =
        messagesEndRef.current.closest(".overflow-y-auto");
      if (messagesContainer) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          // Hide scroll button when scrolling to bottom
          setShowScrollButton(false);
          console.log("Scrolled to bottom immediately");
        });
      } else {
        // Fallback with constrained scrollIntoView
        requestAnimationFrame(() => {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
          // Hide scroll button when scrolling to bottom
          setShowScrollButton(false);
          console.log("Scrolled to bottom with fallback");
        });
      }
    }
  };

  // Check if user is at bottom of messages
  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShowScrollButton(!isAtBottom);

      // Hide notification when user scrolls to bottom
      if (isAtBottom) {
        setNewMessageNotification(false);
      }
    }
  };

  const fetchMessages = async () => {
    if (!chat?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/messages`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
        // Mark chat as read
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/read`,
          {},
          { withCredentials: true }
        );

        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.chatId === chat._id) {
      // Enhanced duplicate prevention
      setMessages((prev) => {
        // Check if message already exists by ID
        const messageExistsById = prev.some(
          (msg) => msg._id === data.message._id
        );
        if (messageExistsById) {
          return prev; // Don't add duplicate by ID
        }

        // Also check for duplicate content from the same sender within a short time
        const recentDuplicate = prev.some(
          (msg) =>
            msg.content === data.message.content &&
            msg.senderId._id === data.message.senderId._id &&
            Math.abs(
              new Date(msg.createdAt) - new Date(data.message.createdAt)
            ) < 1000 // Within 1 second
        );

        if (recentDuplicate) {
          return prev; // Don't add duplicate content
        }

        return [...prev, data.message];
      });
      setOtherUserTyping(false);

      // Check scroll position and scroll to bottom if user is near bottom
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
          const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold
          console.log("Scroll check:", {
            scrollTop,
            scrollHeight,
            clientHeight,
            isNearBottom,
          });
          if (isNearBottom) {
            console.log("User near bottom, scrolling to bottom");
            scrollToBottomImmediate();
          } else {
            console.log("User not near bottom, showing scroll button");
            // Show scroll button and notification if user is not near bottom
            setShowScrollButton(true);
            setNewMessageNotification(true);
            // Hide notification after 5 seconds
            setTimeout(() => setNewMessageNotification(false), 5000);
          }
        }
      }, 50);
    }
  };

  const handleTyping = (e) => {
    const message = e.target.value;
    setNewMessage(message);

    // Emit typing indicator
    if (socket && chat?._id && !typing) {
      setTyping(true);
      socket.emit("user-typing", {
        chatId: chat._id,
        userId: user._id,
        isTyping: true,
      });

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        if (typing) {
          setTyping(false);
          socket.emit("user-typing", {
            chatId: chat._id,
            userId: user._id,
            isTyping: false,
          });
        }
      }, 3000);
    }
  };

  // Clear typing indicator when message is sent
  const clearTypingIndicator = () => {
    if (socket && chat?._id && typing) {
      setTyping(false);
      socket.emit("user-typing", {
        chatId: chat._id,
        userId: user._id,
        isTyping: false,
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat?._id) return;

    try {
      setSending(true);

      // Emit typing stop
      clearTypingIndicator();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/message`,
        { content: newMessage.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Add message to local state
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");

        // Emit message to socket for other users to receive
        if (socket) {
          socket.emit("user-message", {
            chatId: chat._id,
            message: response.data.message,
            receiverId: chat.otherUser._id,
          });

          // Emit event to update chat list with new last message
          socket.emit("user-message-sent", {
            chatId: chat._id,
            message: response.data.message,
          });

          // Also emit a chat-update event for immediate local update
          socket.emit("chat-update", {
            chatId: chat._id,
            message: response.data.message,
          });
        }

        // Directly update the chat list if the function is available
        if (typeof window !== "undefined" && window.updateChatLastMessage) {
          window.updateChatLastMessage(
            chat._id,
            response.data.message.content,
            response.data.message.createdAt
          );
        }

        // Force refresh the entire chat list
        if (typeof window !== "undefined" && window.refreshChatList) {
          window.refreshChatList();
        }

        // Scroll to bottom after sending message
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 50);

        // Notify parent that message was sent
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageCaption("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const sendImage = async () => {
    if (!selectedImage || !chat?._id) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", selectedImage);
      if (imageCaption.trim()) {
        formData.append("caption", imageCaption.trim());
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/image`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        // Add message to local state
        setMessages((prev) => [...prev, response.data.message]);

        // Clear image states
        removeSelectedImage();

        // Emit message to socket for other users to receive
        if (socket) {
          socket.emit("user-message", {
            chatId: chat._id,
            message: response.data.message,
            receiverId: chat.otherUser._id,
          });

          // Emit event to update chat list with new last message
          socket.emit("user-message-sent", {
            chatId: chat._id,
            message: response.data.message,
          });

          // Also emit a chat-update event for immediate local update
          socket.emit("chat-update", {
            chatId: chat._id,
            message: response.data.message,
          });
        }

        // Directly update the chat list if the function is available
        if (typeof window !== "undefined" && window.updateChatLastMessage) {
          window.updateChatLastMessage(
            chat._id,
            response.data.message.content,
            response.data.message.createdAt
          );
        }

        // Force refresh the entire chat list
        if (typeof window !== "undefined" && window.refreshChatList) {
          window.refreshChatList();
        }

        // Scroll to bottom after sending message
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 50);

        // Notify parent that message was sent
        if (onMessageSent) {
          onMessageSent();
        }

        toast.success("Image sent successfully!");
      }
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error("Failed to send image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - allow common document formats
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/rtf",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX, TXT, RTF)"
        );
        return;
      }

      // Validate file size (10MB limit for documents)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Document size should be less than 10MB");
        return;
      }

      setSelectedDocument(file);
    }
  };

  const removeSelectedDocument = () => {
    setSelectedDocument(null);
    setDocumentCaption("");
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const openImageModal = (imageUrl, fileName) => {
    console.log("Opening image modal:", { imageUrl, fileName });
    setSelectedImageModal({ url: imageUrl, fileName });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    console.log("Closing image modal");
    setIsImageModalOpen(false);
    setSelectedImageModal(null);
  };

  const sendDocument = async () => {
    if (!selectedDocument || !chat?._id) return;

    try {
      setUploadingDocument(true);

      const formData = new FormData();
      formData.append("document", selectedDocument);
      if (documentCaption.trim()) {
        formData.append("caption", documentCaption.trim());
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/document`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        // Add message to local state
        setMessages((prev) => [...prev, response.data.message]);

        // Clear document states
        removeSelectedDocument();

        // Emit message to socket for other users to receive
        if (socket) {
          socket.emit("user-message", {
            chatId: chat._id,
            message: response.data.message,
            receiverId: chat.otherUser._id,
          });

          // Emit event to update chat list with new last message
          socket.emit("user-message-sent", {
            chatId: chat._id,
            message: response.data.message,
          });

          // Also emit a chat-update event for immediate local update
          socket.emit("chat-update", {
            chatId: chat._id,
            message: response.data.message,
          });
        }

        // Directly update the chat list if the function is available
        if (typeof window !== "undefined" && window.updateChatLastMessage) {
          window.updateChatLastMessage(
            chat._id,
            response.data.message.content,
            response.data.message.createdAt
          );
        }

        // Force refresh the entire chat list
        if (typeof window !== "undefined" && window.refreshChatList) {
          window.refreshChatList();
        }

        // Scroll to bottom after sending message
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 50);

        // Notify parent that message was sent
        if (onMessageSent) {
          onMessageSent();
        }

        toast.success("Document sent successfully!");
      }
    } catch (error) {
      console.error("Error sending document:", error);
      toast.error("Failed to send document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const renderMessage = (message) => {
    const isOwnMessage = message.senderId._id === user._id;

    return (
      <div
        key={message._id}
        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {message.messageType === "image" ? (
            <div>
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${message.fileUrl}`}
                alt={message.fileName || "Image"}
                className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200"
                style={{ maxHeight: "300px" }}
                onClick={() =>
                  openImageModal(
                    `${process.env.NEXT_PUBLIC_BASE_URL}${message.fileUrl}`,
                    message.fileName
                  )
                }
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              {message.content && message.content !== "📷 Image" && (
                <p className="text-sm mb-2">{message.content}</p>
              )}
              {/* Fallback if image fails to load */}
              <div className="hidden text-sm text-gray-500 mb-2">
                📷 {message.fileName || "Image"}
              </div>
            </div>
          ) : message.messageType === "file" ? (
            <div>
              <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg mb-2">
                <FaFile className="text-2xl text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {message.fileName}
                  </p>
                  <p className="text-xs text-gray-500">Document</p>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}${message.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Download
                </a>
              </div>
              {message.content && message.content !== "📄 Document" && (
                <p className="text-sm mb-2">{message.content}</p>
              )}
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          <p
            className={`text-xs mt-1 ${
              isOwnMessage ? "text-purple-100" : "text-gray-500"
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
        >
          <FaArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center flex-1">
          {chat.otherUser?.image ? (
            <img
              src={chat.otherUser.image}
              alt={chat.otherUser.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              <FaUser className="text-gray-600" />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900">
              {chat.otherUser?.name || "Unknown User"}
            </h3>
            <div className="flex items-center space-x-2">
              {otherUserTyping && (
                <p className="text-sm text-gray-500 italic">typing...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative"
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => renderMessage(message))}
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* New message notification */}
        {newMessageNotification && (
          <div
            className="fixed bottom-32 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-bounce cursor-pointer"
            onClick={() => {
              scrollToBottomImmediate();
              setNewMessageNotification(false);
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">New message!</span>
              <span className="text-xs opacity-80">Click to view</span>
            </div>
          </div>
        )}

        {/* Other user message notification - Simplified */}
        {otherUserMessageNotification && (
          <div className="fixed top-20 right-6 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg z-20 text-sm">
            <div className="flex items-center space-x-2">
              <span>💬</span>
              <span>
                {otherUserMessageNotification.senderName} sent you a message
              </span>
              <button
                onClick={() => setOtherUserMessageNotification(null)}
                className="ml-2 text-purple-200 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottomImmediate}
            className="fixed bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 z-10"
            title="Scroll to bottom (Ctrl+End)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0 mt-auto">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Image Preview
              </span>
              <button
                onClick={removeSelectedImage}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto rounded-lg mb-2"
              style={{ maxHeight: "200px" }}
            />
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Add a caption (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        )}

        {/* Document Preview */}
        {selectedDocument && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Document Preview
              </span>
              <button
                onClick={removeSelectedDocument}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white rounded border">
              <FaFile className="text-2xl text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedDocument.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <input
              type="text"
              value={documentCaption}
              onChange={(e) => setDocumentCaption(e.target.value)}
              placeholder="Add a caption (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mt-2"
            />
          </div>
        )}

        <div className="flex space-x-3">
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
            onChange={handleDocumentSelect}
            className="hidden"
          />

          {/* Image picker button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <FaImage className="w-5 h-5" />
          </button>

          {/* Document picker button */}
          <button
            onClick={() => documentInputRef.current?.click()}
            className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaFile className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={sending || uploadingImage || uploadingDocument}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (selectedImage) {
                    sendImage();
                  } else if (selectedDocument) {
                    sendDocument();
                  } else {
                    sendMessage();
                  }
                }
              }}
            />
            {typing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs">
                typing...
              </div>
            )}
          </div>

          <button
            onClick={
              selectedImage
                ? sendImage
                : selectedDocument
                ? sendDocument
                : sendMessage
            }
            disabled={
              (!newMessage.trim() && !selectedImage && !selectedDocument) ||
              sending ||
              uploadingImage ||
              uploadingDocument
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending || uploadingImage || uploadingDocument ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>

      {/* Image Modal/Overlay */}
      {isImageModalOpen && selectedImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center "
          onClick={closeImageModal}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <img
              src={selectedImageModal.url}
              alt={selectedImageModal.fileName || "Image"}
              className="max-w-[90vw] max-h-[70vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualUserChat;
