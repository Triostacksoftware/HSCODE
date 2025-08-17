import mongoose from "mongoose";
import bcrypt from "bcrypt";

const superAdminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
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
  { timestamps: true }
);

// Hash password before saving
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const SuperAdminModel = mongoose.model("SuperAdmin", superAdminSchema);

export default SuperAdminModel;
