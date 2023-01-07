import Mongoose from "mongoose";

const adminSchema = new Mongoose.Schema(
  {
    name: { type: String, required: [true, "name required"] },  
    email:{type:String,required:[true,"Email Required"]},  
    password: { type: String, required: [true, "password requred"] },
    createdDate:{
      type:Date,
      default:Date.now
    },
  },
  {
    timestamps: true,
  }
);

Mongoose.pluralize(null)

const AdminSignupModel = Mongoose.model("Adminsignup", adminSchema);

export default AdminSignupModel;
