// models/Location.js
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Location', LocationSchema);
