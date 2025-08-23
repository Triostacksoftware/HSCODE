import mongoose from "mongoose";

const GlobalGroupSchema = mongoose.Schema({
  name: { type: String, required: true },
  heading: { type: String, required: true },
  image: { type: String }, // path string
  chapterNumber: { type: String, required: true }, // HS Code chapter number
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const GlobalGroupModel = mongoose.model("GlobalGroup", GlobalGroupSchema);
export default GlobalGroupModel;
