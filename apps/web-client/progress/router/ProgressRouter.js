import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile from "../../../../Multer_config.js";
import AppliedModel from "../../job/model/AppliedModel.js";
import Jobmodel from "../../job/model/JobModel.js";
import UserProfileImages from "../../profile/model/UserImages.js";
import ProfileModel from "../../profile/model/UserProfile.js";
import PromoterProfileImages from "../../sign_up_api/model/PromoterImagesModel.js";
import SignUpModel from "../../sign_up_api/model/SignUpModel.js";
import { isAuth } from "../../util.js";
import ProgressModel from "../model/ProgressModel.js";

const Progressrouter = express.Router();

Progressrouter.post(
  "/apply",
  isAuth,
  uploadFile,
  expressAsyncHandler(async (req, res) => {
    const getloggedInUser = await SignUpModel.findOne({
      email: req.user.email,
    });

    const Job = await Jobmodel.findById(req.body.Extension.jobs)

    const extenObject = Object.assign(req.body.Extension, {
      user_by: getloggedInUser._id,job_status:"Applied",posted_by:Job.posted_by,price:Job.payment
    });

    const applied = new AppliedModel(extenObject);
    applied.save()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send("Bad Request");
    });

  })
);

Progressrouter.put(
  "/editJobStatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { object_id, status } = req.body;

    const saveProgess = await AppliedModel.updateOne({_id:object_id},{
      
      $set:{
        job_status:status}
      })
    //   { _id: object_id, "job_code.job_name": job_id },

    //   {
    //     $set: {
    //       "job_code.$.status": status,
    //     },
    //   },
    //   { multi: true }
    // );

    res.status(200).send(saveProgess);
  })
);

Progressrouter.get(
  "/jobstatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {

    const getloggedInUser = await SignUpModel.findOne({
      email: req.user.email,
    });

    const dta = await AppliedModel.find({user_by:getloggedInUser._id})

    const findalData = await Promise.all(dta.map(async(dtaa)=>{

      const job = await Jobmodel.findById(dtaa.jobs)
      return {
        job,
        status:dtaa.job_status
      }

    }))


    res.status(200).send(findalData);
  })
);

Progressrouter.get(
  "/allpromoterjobs",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const PromoterAllJobs = await Jobmodel.find({ posted_by: req.user._id });
    res.status(200).send(PromoterAllJobs);
  })
);

Progressrouter.get(
  "/promoterappliedStatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const Allied_Data = await AppliedModel.find({ jobs: req.body.jobid });


    const arrX = await Promise.all(
      Allied_Data.map(async (data) => {
        const news = await SignUpModel.findById(data.user_by);
        return {
          news,
        };
      })
    );

    res.send(arrX);
  })
);

Progressrouter.get(
  "/totalearning",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const data = await (await AppliedModel.find({posted_by:req.user._id}).where({job_status:"Completed"}).select("price")).length
    const count = await (await AppliedModel.find({posted_by:req.user._id}).where({job_status:"Completed"}).select("price")).length
    let sum = 0
    for (let i = 0;i<data.length;i++){
      sum +=  parseInt(data[i].price)
    }

    res.status(200).send("Sum= "+sum+" ~count= "+count)
  })
);

export default Progressrouter;
