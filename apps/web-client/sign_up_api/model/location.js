// models/Location.js
import { Schema, model } from 'mongoose';

const LocationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default model('Location', LocationSchema);
