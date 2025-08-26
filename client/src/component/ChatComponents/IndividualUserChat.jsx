"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { FaArrowLeft, FaPaperPlane, FaUser } from "react-icons/fa";
import axios from "axios";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";

const IndividualUserChat = ({ chat, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useContext(OnlineUsersContext);

  // Fetch messages when chat changes
  useEffect(() => {
    if (chat?._id) {
      fetchMessages();
    }
  }, [chat?._id]);

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
      // Find the messages container to ensure scrolling happens within it
      const messagesContainer =
        messagesEndRef.current.closest(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        // Fallback with constrained scrollIntoView
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat?._id) return;

    try {
      setSending(true);

      // Emit typing stop
      if (socket) {
        socket.emit("user-typing", {
          chatId: chat._id,
          userId: user._id,
          isTyping: false,
        });
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/message`,
        { content: newMessage.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Add message to local state
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");
        setTyping(false);

        // Emit message to socket for other users to receive
        if (socket) {
          socket.emit("user-message", {
            chatId: chat._id,
            message: response.data.message,
            receiverId: chat.otherUser._id,
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="p-2 mr-3 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
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
            {otherUserTyping && (
              <p className="text-sm text-gray-500 italic">typing...</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId._id === user._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId._id === user._id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId._id === user._id
                      ? "text-purple-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={sending}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualUserChat;
