import UserModel from "../models/user.js";
import LocalGroupModel from "../models/LocalGroup.js";
import GlobalGroupModel from "../models/GlobalGroup.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";
import { io } from "../server.js";

// GET GROUP by IDs (for user's joined groups)
export const getGroups = async (req, res) => {
  console.log("getGroups");
  try {
    const id = req.user.id;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const groups = await LocalGroupModel.find({
      _id: { $in: user.groupsID },
    });

    // compute unread counts: approved leads after lastReadAt
    const groupIdToLastRead = new Map(
      (user.groupReads || []).map((gr) => [String(gr.groupId), gr.lastReadAt])
    );
    const unreadMap = {};
    await Promise.all(
      groups.map(async (g) => {
        const lastRead = groupIdToLastRead.get(String(g._id)) || new Date(0);
        const [buy, sell] = await Promise.all([
          ApprovedLeads.countDocuments({
            groupId: g._id,
            createdAt: { $gt: lastRead },
            type: "buy",
            userId: { $ne: user._id },
          }),
          ApprovedLeads.countDocuments({
            groupId: g._id,
            createdAt: { $gt: lastRead },
            type: "sell",
            userId: { $ne: user._id },
          }),
        ]);
        unreadMap[String(g._id)] = { buy, sell };
      })
    );

    const enriched = groups.map((g) => ({
      ...g.toObject(),
      unreadBuyCount: unreadMap[String(g._id)]?.buy || 0,
      unreadSellCount: unreadMap[String(g._id)]?.sell || 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching groups by IDs:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// GET GLOBAL GROUPS by IDs (for user's joined global groups)
export const getGlobalGroups = async (req, res) => {
  try {
    const { groupIds } = req.body;
    const userId = req.user.id;
    console.log("groupIds", groupIds);
    console.log("userId", userId);

    const user = await UserModel.findById(userId);
    console.log("user", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const groups = await GlobalGroupModel.find({
      _id: { $in: groupIds },
    });

    // unread for global groups
    const groupIdToLastRead = new Map(
      (user.globalGroupReads || []).map((gr) => [
        String(gr.groupId),
        gr.lastReadAt,
      ])
    );
    const unreadMap = {};
    await Promise.all(
      groups.map(async (g) => {
        const lastRead = groupIdToLastRead.get(String(g._id)) || new Date(0);
        const [buy, sell] = await Promise.all([
          GlobalApprovedLeads.countDocuments({
            groupId: g._id,
            createdAt: { $gt: lastRead },
            type: "buy",
            userId: { $ne: user._id },
          }),
          GlobalApprovedLeads.countDocuments({
            groupId: g._id,
            createdAt: { $gt: lastRead },
            type: "sell",
            userId: { $ne: user._id },
          }),
        ]);
        unreadMap[String(g._id)] = { buy, sell };
      })
    );
    const enriched = groups.map((g) => ({
      ...g.toObject(),
      unreadBuyCount: unreadMap[String(g._id)]?.buy || 0,
      unreadSellCount: unreadMap[String(g._id)]?.sell || 0,
    }));
    res.json(enriched);
  } catch (err) {
    console.error("Error fetching global groups by IDs:", err);
    res.status(500).json({ message: "Error fetching global groups" });
  }
};

// MARK local group as read (update lastReadAt)
export const markGroupRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const idx = (user.groupReads || []).findIndex(
      (gr) => String(gr.groupId) === String(groupId)
    );
    if (idx >= 0) {
      user.groupReads[idx].lastReadAt = new Date();
    } else {
      user.groupReads.push({ groupId, lastReadAt: new Date() });
    }
    await user.save();
    res.json({ message: "Marked read" });
  } catch (err) {
    console.error("Error marking group read:", err);
    res.status(500).json({ message: "Error marking group read" });
  }
};

// MARK global group as read
export const markGlobalGroupRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const idx = (user.globalGroupReads || []).findIndex(
      (gr) => String(gr.groupId) === String(groupId)
    );
    if (idx >= 0) {
      user.globalGroupReads[idx].lastReadAt = new Date();
    } else {
      user.globalGroupReads.push({ groupId, lastReadAt: new Date() });
    }
    await user.save();
    res.json({ message: "Marked read" });
  } catch (err) {
    console.error("Error marking global group read:", err);
    res.status(500).json({ message: "Error marking global group read" });
  }
};

// GET USER BY ID (for user info sidebar)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if user exists
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user information (excluding sensitive data)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      image: user.image,
      about: user.about,
      companyWebsite: user.companyWebsite,
      groupsID: user.groupsID,
      globalGroupsID: user.globalGroupsID,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Error fetching user information" });
  }
};

// JOIN GROUP
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id || req.userData._id;

    // Check if group exists
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get user and check if already joined
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already in the group
    if (user.groupsID.includes(groupId)) {
      return res.status(400).json({ message: "User is already in this group" });
    }

    // Check if user is already in the group's members array
    if (group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Add group to user's groupsID array
    user.groupsID.push(groupId);
    await user.save();

    // Add user to group's members array
    group.members.push(userId);
    await group.save();

    // Emit socket event to notify all group members about new member
    io.emit("user-joined-group", {
      groupId: groupId,
      userId: userId,
      userName: user.name,
      userImage: user.image,
      message: `${user.name} joined the group`,
    });

    // Add user to the group socket room to update online status immediately
    io.in(`user-${userId}`)
      .fetchSockets()
      .then(async (userSockets) => {
        userSockets.forEach((socket) => {
          socket.join(`group-${groupId}`);
          console.log(`User ${userId} added to group-${groupId} room`);
        });

        // Broadcast updated online users list immediately after room change
        const clients =
          io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
        const userIds = Array.from(clients)
          .map((sid) => {
            const socket = io.sockets.sockets.get(sid);
            return socket?.handshake.query.userId;
          })
          .filter(Boolean);

        const uniqueUserIds = [...new Set(userIds)];

        try {
          const users = await UserModel.find(
            { _id: { $in: uniqueUserIds } },
            { _id: 1, name: 1, role: 1 }
          ).lean();

          const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            role: user.role,
          }));

          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: uniqueUserIds,
            onlineUsers: formattedUsers,
          });

          console.log(
            `Updated online users for group ${groupId} after user ${userId} joined`
          );
        } catch (error) {
          console.error(
            `Error broadcasting online users for group ${groupId}:`,
            error
          );
          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: [],
            onlineUsers: [],
          });
        }
      })
      .catch((err) => {
        console.error("Error adding user to group room:", err);
      });

    res.json({
      message: "Successfully joined group",
      groupsID: user.groupsID,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Error joining group" });
  }
};

// JOIN GLOBAL GROUP
export const joinGlobalGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id || req.userData._id;

    // Check if global group exists
    const group = await GlobalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    // Get user and check if already joined
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already in the global group
    if (user.globalGroupsID && user.globalGroupsID.includes(groupId)) {
      return res
        .status(400)
        .json({ message: "User is already in this global group" });
    }

    // Check if user is already in the group's members array
    if (group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this global group" });
    }

    // Initialize globalGroupsID array if it doesn't exist
    if (!user.globalGroupsID) {
      user.globalGroupsID = [];
    }

    // Add group to user's globalGroupsID array
    user.globalGroupsID.push(groupId);
    console.log("user", user);
    await user.save();
    console.log("user", user);

    // Add user to group's members array
    group.members.push(userId);
    await group.save();

    // Emit socket event to notify all group members about new member
    io.emit("user-joined-global-group", {
      groupId: groupId,
      userId: userId,
      userName: user.name,
      userImage: user.image,
      message: `${user.name} joined the group`,
    });

    // Add user to the group socket room to update online status immediately
    io.in(`user-${userId}`)
      .fetchSockets()
      .then(async (userSockets) => {
        userSockets.forEach((socket) => {
          socket.join(`group-${groupId}`);
          console.log(`User ${userId} added to global group-${groupId} room`);
        });

        // Broadcast updated online users list immediately after room change
        const clients =
          io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
        const userIds = Array.from(clients)
          .map((sid) => {
            const socket = io.sockets.sockets.get(sid);
            return socket?.handshake.query.userId;
          })
          .filter(Boolean);

        const uniqueUserIds = [...new Set(userIds)];

        try {
          const users = await UserModel.find(
            { _id: { $in: uniqueUserIds } },
            { _id: 1, name: 1, role: 1 }
          ).lean();

          const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            role: user.role,
          }));

          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: uniqueUserIds,
            onlineUsers: formattedUsers,
          });

          console.log(
            `Updated online users for global group ${groupId} after user ${userId} joined`
          );
        } catch (error) {
          console.error(
            `Error broadcasting online users for global group ${groupId}:`,
            error
          );
          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: [],
            onlineUsers: [],
          });
        }
      })
      .catch((err) => {
        console.error("Error adding user to global group room:", err);
      });

    res.json({
      message: "Successfully joined global group",
      globalGroupsID: user.globalGroupsID,
    });
  } catch (error) {
    console.error("Error joining global group:", error);
    res.status(500).json({ message: "Error joining global group" });
  }
};

// LEAVE GROUP
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id || req.userData._id;

    // Check if group exists
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get user and check if in group
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is in the group
    if (!user.groupsID.includes(groupId)) {
      return res.status(400).json({ message: "User is not in this group" });
    }

    // Remove group from user's groupsID array
    user.groupsID = user.groupsID.filter((id) => id.toString() !== groupId);
    await user.save();

    // Remove user from group's members array
    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();

    // Emit socket event to notify all group members about member leaving
    io.emit("user-left-group", {
      groupId: groupId,
      userId: userId,
      userName: user.name,
      message: `${user.name} left the group`,
    });

    // Remove user from the group socket room to update online status immediately
    io.in(`user-${userId}`)
      .fetchSockets()
      .then(async (userSockets) => {
        userSockets.forEach((socket) => {
          socket.leave(`group-${groupId}`);
          console.log(`User ${userId} removed from group-${groupId} room`);
        });

        // Broadcast updated online users list immediately after room change
        const clients =
          io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
        const userIds = Array.from(clients)
          .map((sid) => {
            const socket = io.sockets.sockets.get(sid);
            return socket?.handshake.query.userId;
          })
          .filter(Boolean);

        const uniqueUserIds = [...new Set(userIds)];

        try {
          const users = await UserModel.find(
            { _id: { $in: uniqueUserIds } },
            { _id: 1, name: 1, role: 1 }
          ).lean();

          const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            role: user.role,
          }));

          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: uniqueUserIds,
            onlineUsers: formattedUsers,
          });

          console.log(
            `Updated online users for group ${groupId} after user ${userId} left`
          );
        } catch (error) {
          console.error(
            `Error broadcasting online users for group ${groupId}:`,
            error
          );
          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: [],
            onlineUsers: [],
          });
        }
      })
      .catch((err) => {
        console.error("Error removing user from group room:", err);
      });

    res.json({
      message: "Successfully left group",
      groupsID: user.groupsID,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Error leaving group" });
  }
};

// LEAVE GLOBAL GROUP
export const leaveGlobalGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id || req.userData._id;

    // Check if global group exists
    const group = await GlobalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    // Get user and check if in global group
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is in the global group
    if (!user.globalGroupsID || !user.globalGroupsID.includes(groupId)) {
      return res
        .status(400)
        .json({ message: "User is not in this global group" });
    }

    // Remove group from user's globalGroupsID array
    user.globalGroupsID = user.globalGroupsID.filter(
      (id) => id.toString() !== groupId
    );
    await user.save();

    // Remove user from group's members array
    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();

    // Emit socket event to notify all group members about member leaving
    io.emit("user-left-global-group", {
      groupId: groupId,
      userId: userId,
      userName: user.name,
      message: `${user.name} left the group`,
    });

    // Remove user from the group socket room to update online status immediately
    io.in(`user-${userId}`)
      .fetchSockets()
      .then(async (userSockets) => {
        userSockets.forEach((socket) => {
          socket.leave(`group-${groupId}`);
          console.log(
            `User ${userId} removed from global group-${groupId} room`
          );
        });

        // Broadcast updated online users list immediately after room change
        const clients =
          io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
        const userIds = Array.from(clients)
          .map((sid) => {
            const socket = io.sockets.sockets.get(sid);
            return socket?.handshake.query.userId;
          })
          .filter(Boolean);

        const uniqueUserIds = [...new Set(userIds)];

        try {
          const users = await UserModel.find(
            { _id: { $in: uniqueUserIds } },
            { _id: 1, name: 1, role: 1 }
          ).lean();

          const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            role: user.role,
          }));

          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: uniqueUserIds,
            onlineUsers: formattedUsers,
          });

          console.log(
            `Updated online users for global group ${groupId} after user ${userId} left`
          );
        } catch (error) {
          console.error(
            `Error broadcasting online users for global group ${groupId}:`,
            error
          );
          io.to(`group-${groupId}`).emit("group-online-users", {
            groupId,
            onlineUserIds: [],
            onlineUsers: [],
          });
        }
      })
      .catch((err) => {
        console.error("Error removing user from global group room:", err);
      });

    res.json({
      message: "Successfully left global group",
      globalGroupsID: user.globalGroupsID,
    });
  } catch (error) {
    console.error("Error leaving global group:", error);
    res.status(500).json({ message: "Error leaving global group" });
  }
};
