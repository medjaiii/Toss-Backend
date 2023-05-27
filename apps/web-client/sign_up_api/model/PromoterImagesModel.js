import mongoose from "mongoose";

const PromoterProfileImageSchema = mongoose.Schema({
  promoterImages: {
    type: String,
    required: [true, "Please provide an image"],
  },
});

mongoose.pluralize(null);

const PromoterProfileImages = mongoose.model(
  "PromoterProfileImages",
  PromoterProfileImageSchema
);

export default PromoterProfileImages;
