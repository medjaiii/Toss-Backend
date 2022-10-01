import Mongoose from "mongoose";

const signupSchema = new Mongoose.Schema(
  {
    full_name: { type: String, required: [true, "name required"] },    
    work_email: {
      type: String,
      required: [true, "Email required"],
    },
    company_Name: {
      type: String,
      required: [true, "Company required"],
    },
    office_address :{
        type:String,
        required:[true,"Address Required"]
    },
    password: { type: String, required: [true, "password requred"] },
    job_images:{ type: Mongoose.Schema.Types.ObjectId,ref :"PromoterProfileImages"},
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
signupSchema.index({work_email:1},{unique:true})

const PromoterSignUpModel = Mongoose.model("PromoterSignUp", signupSchema);

export default PromoterSignUpModel;
