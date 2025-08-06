import UserModel from "../models/user.js";
import LocalGroupModel from "../models/LocalGroup.js";
import GlobalGroupModel from "../models/GlobalGroup.js";

// GET GROUP by IDs (for user's joined groups)
export const getGroups = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const groups = await LocalGroupModel.find({
      _id: { $in: user.groupsID },
    }).populate("categoryId");

    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups by IDs:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// GET GLOBAL GROUPS by IDs (for user's joined global groups)
export const getGlobalGroups = async (req, res) => {
  console.log("hit backend ");
  try {
    const { groupIds } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const groups = await GlobalGroupModel.find({
      _id: { $in: groupIds },
    }).populate("categoryId");
    console.log("super groups", groups);
    res.json(groups);
  } catch (err) {
    console.error("Error fetching global groups by IDs:", err);
    res.status(500).json({ message: "Error fetching global groups" });
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

    // Add group to user's groupsID array
    user.groupsID.push(groupId);
    await user.save();

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

    // Initialize globalGroupsID array if it doesn't exist
    if (!user.globalGroupsID) {
      user.globalGroupsID = [];
    }

    // Add group to user's globalGroupsID array
    user.globalGroupsID.push(groupId);
    await user.save();

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

    res.json({
      message: "Successfully left global group",
      globalGroupsID: user.globalGroupsID,
    });
  } catch (error) {
    console.error("Error leaving global group:", error);
    res.status(500).json({ message: "Error leaving global group" });
  }
};
