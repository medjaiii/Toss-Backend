import Mongoose from "mongoose";

const GroupChatSchema = new Mongoose.Schema({
    groupName: { type: String, required: true },
    groupDescription: { type: String, required: true },
    members: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true }],
    messages: [{
        senderId: { type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    createdAt: { type: Date, default: Date.now },
});

export default Mongoose.model('GroupChat', GroupChatSchema);
