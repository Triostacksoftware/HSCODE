import mongoose from "mongoose";

const LocalGroupSchema = mongoose.Schema({
    name: { type: String, required: true },
    hscode: { type: String, required: true },
    image: { type: String }, // path string
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LocalCategory',
        required: true
    }
});

const LocalGroupModel = mongoose.model('LocalGroup', LocalGroupSchema);
export default LocalGroupModel;
