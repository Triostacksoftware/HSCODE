import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    image: { type: String },
    about: { type: String },
    companyWebsite: { type: String, trim: true },
    preferences: { type: Object },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      local: { type: Boolean, default: true },
      global: { type: Boolean, default: true },
      individual: { type: Boolean, default: true },
    },

    password: {
      type: String,
      required: true,
    },

    countryCode: {
      type: String,
      required: true,
    },

    membership: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    groupsID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    globalGroupsID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalGroup",
      },
    ],

    // Per-group last read timestamp for unread counts
    groupReads: [
      {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "LocalGroup" },
        lastReadAt: { type: Date, default: null },
      },
    ],
    globalGroupReads: [
      {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "GlobalGroup" },
        lastReadAt: { type: Date, default: null },
      },
    ],

    // Admin-specific fields
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    totpSecret: {
      type: String,
      default: null,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    // if modified field is not password
    if (!this.isModified("password")) return next();

    // if password changed so hash and store
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
