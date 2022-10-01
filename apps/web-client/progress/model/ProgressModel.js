import Mongoose from "mongoose";

const progressSchema = new Mongoose.Schema(
  {
    job_code:[
      {
        job_name:{ type: Mongoose.Schema.Types.ObjectId,ref :"Jobmodel"},
        status:{type:String,default:"Unassigned"},
      }
    ],
    applied_by : {type: Mongoose.Schema.Types.ObjectId,ref :"SignUp"},
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

const ProgressModel = Mongoose.model("ProgressSchema", progressSchema);

export default ProgressModel;
