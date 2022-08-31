import mongoose from "mongoose";

const UserProfileImageSchema = mongoose.Schema({
  userProfileImage: {
    _id: mongoose.Types.ObjectId(),
    type: [{ name: String }],
    required: [true, "Please Provide Atleast 1 Image"],
    default: undefined,
  },
});

mongoose.pluralize(null);

const UserProfileImages = mongoose.model(
  "UserProfileImages",
  UserProfileImageSchema
);

export default UserProfileImages;
