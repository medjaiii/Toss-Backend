import mongoose from "mongoose";

const PromoterProfileVideoSchema = mongoose.Schema({
    promoterVideo: {
        type: String,
        required: [true, "Please provide a video URL"]
    }
});

mongoose.pluralize(null);

const PromoterProfileVideo = mongoose.model(
    "PromoterProfileVideo",
    PromoterProfileVideoSchema
);

export default PromoterProfileVideo;
