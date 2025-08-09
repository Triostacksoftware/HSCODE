import mongoose from "mongoose";

const LocalCategorySchema = mongoose.Schema({
    name: { type: String, required: true },
    countryCode: { type: String, required: true },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    chapter: {
        type: String,
        required: true
    }
});

const LocalCategoryModel = mongoose.model('LocalCategory', LocalCategorySchema);
export default LocalCategoryModel;
