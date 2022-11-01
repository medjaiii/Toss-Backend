import Mongoose from "mongoose";

const appliedSchema = new Mongoose.Schema(
  {
    jobs: { type: String, required: [true, "name required"] },
    user_by : {type:String},
    job_status:{type:String},
    price:{type:String},
    posted_by:{type:String},

  },
  {
    timestamps: true,
  }
);

Mongoose.pluralize(null)
// jobSchema.index({work_email:1},{unique:true})

const AppliedModel = Mongoose.model("Appliedmodel", appliedSchema);

export default AppliedModel;
