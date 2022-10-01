import mongoose from "mongoose";

const PromoterProfileImageSchema = mongoose.Schema({
    promoterImages: {
    _id: mongoose.Types.ObjectId(),
    type: [{ name: String }],
    required: [true, "Please Provide Atleast 1 Image"],
    default: undefined,
  },
});

mongoose.pluralize(null);

const PromoterProfileImages = mongoose.model(
  "PromoterProfileImages",
  PromoterProfileImageSchema
);

export default PromoterProfileImages;
