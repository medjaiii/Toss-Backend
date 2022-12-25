import express from "express";
import expressAsyncHandler from "express-async-handler";
import Jobmodel from "../model/JobModel.js";
import uploadFile from "../../../../Multer_config.js";
import { isAuth, isPromoterAuth } from "../../util.js";
import AppliedModel from "../model/AppliedModel.js";

const Jobrouter = express.Router();

Jobrouter.post(
  "/new",
  isPromoterAuth,
  uploadFile,
  expressAsyncHandler(async (req, res) => {
    
    const jobObject = Object.assign(req.body, { job_images: req.files[0].location,posted_by:req.user });

    const jobmodel = new Jobmodel(jobObject);

    jobmodel
      .save()
      .then((data) => {
        res.status(200).json({
          id: data._id,
        });
      })
      .catch((err) => {
        res.status(400).json({ message: err });
      });
  })
);

Jobrouter.get(
  "/alljobs",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {

    const getAppliedJobs = await AppliedModel.find({"user_by":req.user._id})
    if(getAppliedJobs.length>0){
      const getarr = getAppliedJobs.map((data)=>data.jobs)
      console.log(getarr)
      const getalljobs = await Jobmodel.find({_id:{"$nin":getarr}})
      res.status(200).send(getalljobs);
    }else{
      const getalljobs = await Jobmodel.find({job_status:{$ne:"Disable"}});
      res.status(200).send(getalljobs);
    }

  })
);

//close job
Jobrouter.post(
  "/closeJob",
  isPromoterAuth,
  expressAsyncHandler(async (req, res, next) => {

    await Jobmodel.findByIdAndUpdate({_id:req.body.jobID,posted_by:req.user._id},{"job_status":"Disable"}).exec(function(err,dta){
      if(err){
        res.status(400).send("Error While Closing job")
      }else{

        res.status(200).send({"message":"Job Closed Successfully"});
      }
    })

  })
);

export default Jobrouter;
