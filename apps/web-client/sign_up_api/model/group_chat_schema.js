import Mongoose from "mongoose";

const GroupChatSchema = new Mongoose.Schema({
    groupName: { type: String, required: true },
    groupDescription: { type: String, required: true },
    groupProfilePic: { type: String, required: true },
    adminId: { type: String, required: true },
    members: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true }],
    messages: [{
        senderId: { type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
        senderName: { type: String, required: true },
        messageType: { type: String, required: true },
        isReplying: { type: Boolean, required: false, default: false },
        replyMessageId: { type: Mongoose.Schema.Types.ObjectId, default: null, required: false },
        fileUrl: { type: String, required: false },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default Mongoose.model('GroupChat', GroupChatSchema);
