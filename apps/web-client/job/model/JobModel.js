import Mongoose from "mongoose";

const jobSchema = new Mongoose.Schema(
  {
    job_name: { type: String, required: [true, "name required"] },    
    recepient: {
      type: String,
    },
    company_Name: {
      type: String,
    },
    description :{
        type:String,
    },
    requirement: { type: String },
    workers: { type: Number},
    address: { type: String },
    pincode: { type: String },
    duration:{
        startDuration:{type:String},
        endDuration:{type:String},
    },
    job_images:{ type: String},
    posted_by:{type: Mongoose.Schema.Types.ObjectId,ref:"PromoterSignUp"},
    payment:{type:Number,default:500},
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
// jobSchema.index({work_email:1},{unique:true})

const Jobmodel = Mongoose.model("Jobmodel", jobSchema);

export default Jobmodel;
