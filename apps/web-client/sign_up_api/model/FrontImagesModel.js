import mongoose from "mongoose";

const UserFrontImageSchema = mongoose.Schema({
  ProfileImage: {
    _id: mongoose.Types.ObjectId(),
    type: String,
    required: [true, "Please provide an image"],
  },
});

mongoose.pluralize(null);

const FrontImages = mongoose.model(
  "UserFrontImages",
  UserFrontImageSchema
);

export default FrontImages;
