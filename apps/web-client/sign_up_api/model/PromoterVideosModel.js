import mongoose from "mongoose";

const PromoterProfileVideoSchema = mongoose.Schema({
    promoterVideo: {
        type: String,
        required: false, // Make the field optional
        default: null    // Default to null when the video is not available
    }
});

mongoose.pluralize(null);

const PromoterProfileVideo = mongoose.model(
    "PromoterProfileVideo",
    PromoterProfileVideoSchema
);

export default PromoterProfileVideo;
