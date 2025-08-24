import mongoose from "mongoose";

const LocalGroupSchema = mongoose.Schema({
  name: { type: String, required: true },
  heading: { type: String, required: true },
  image: { type: String }, // path string
  chapterNumber: { type: String, required: true }, // HS Code chapter number
  countryCode: { type: String, required: true }, // Country code for filtering
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const LocalGroupModel = mongoose.model("LocalGroup", LocalGroupSchema);
export default LocalGroupModel;
