import mongoose from "mongoose";
import UserProfileImages from "./UserImages.js";
const { Schema } = mongoose;


const UserSignUp = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Name Required"],
  },
  email:{
    type:String,
    required:[true,"email required"],

  },
  contactNumber:{
    type:Number,
    required:[true,"phone number required"],
  },
  city:{
    type:String,
    required:[true,"city required"],
  },
  area:{
    type:String,
    required:[true,"area required"],

  },
  about:{
    type:String,
    required:[false],
    maxlength:100,
  },
  previousExpereince:{
    type:String,
    required:[false],
  },
  skills: {
    type: [{
        name : String,
    }],
    default: undefined
},
  profileImages:{ type: mongoose.Schema.Types.ObjectId,ref :"UserProfileImages"}
});

mongoose.pluralize(null)

const ProfileModel = mongoose.model("Profile", UserSignUp);

export default ProfileModel;
