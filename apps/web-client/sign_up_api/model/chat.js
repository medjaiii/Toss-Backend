// import * as mongoose from 'mongoose';

// const { Schema, model } = mongoose;
import Mongoose from "mongoose";

const ChatMessageSchema = new Mongoose.Schema({
    senderId: { type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Mongoose.Schema({
    user1: { type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
    user2: { type: Mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
    messages: [ChatMessageSchema] // Array to store all chat messages between the two users
});

export default Mongoose.model('Chat', ChatSchema);