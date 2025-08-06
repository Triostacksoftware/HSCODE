import mongoose from "mongoose";

const GlobalGroupSchema = mongoose.Schema({
  name: { type: String, required: true },
  hscode: { type: String, required: true },
  image: { type: String }, // path string
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GlobalCategory",
    required: true,
  },
});

const GlobalGroupModel = mongoose.model("GlobalGroup", GlobalGroupSchema);
export default GlobalGroupModel;
