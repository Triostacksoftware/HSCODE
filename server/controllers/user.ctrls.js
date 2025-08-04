import UserModel from "../models/User.js";
import LocalGroupModel from "../models/LocalGroup.js";


// GET GROUP by IDs (for user's joined groups)
export const getGroups = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({message: 'User not found'});

    const groups = await LocalGroupModel.find({
      _id: { $in: user.groupsID },
    }).populate("categoryId");

    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups by IDs:", err);
    res.status(500).json({ message: "Error fetching groups" });
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
