import mongoose from "mongoose";

const GlobalCategorySchema = mongoose.Schema({
  name: { type: String, required: true },
  chapter: { type: String, required: true },
});

const GlobalCategoryModel = mongoose.model(
  "GlobalCategory",
  GlobalCategorySchema
);
export default GlobalCategoryModel;
