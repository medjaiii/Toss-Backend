import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile from "../../../../Multer_config.js";
import Jobmodel from "../../job/model/JobModel.js";
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

    const finalData = Object.assign(req.body, {
      applied_by: getloggedInUser._id,
    });

    const saveProgess = new ProgressModel(finalData);
    saveProgess
      .save()
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
    
    const {object_id,job_id,status} = req.body

    const saveProgess = await ProgressModel.updateOne({_id:object_id,"job_code.job_name":job_id},
    
    {'$set': {
      'job_code.$.status': status,
  }},{"multi":true})

  res.status(200).send(saveProgess)

  })
);

Progressrouter.get(
  "/jobstatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    
    const getloggedInUser = await SignUpModel.findOne({
      email: req.user.email,
    });

    const jobmodel = await ProgressModel.find({
      applied_by: getloggedInUser._id,
    });

    const myData = []
    for (let i= 0;i<jobmodel.length;i++){
      let job_code = jobmodel[i].job_code
      for(let jobdata of job_code){
        myData.push(jobdata)
      }
    }
    const xData = []

    for(let i = 0;i<myData.length;i++){
      const ob = {}
      const name = myData[i].job_name
      const figure = await Jobmodel.findById(name)
      const queryKey = await PromoterProfileImages.findById(figure.job_images);
      ob.data = figure
      ob.status = myData[i].status
      ob.image = queryKey
      xData.push(ob)
    }

    res.status(200).send(xData);
  })
);


Progressrouter.get(
  "/promoterjobstatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const ProgressData = await ProgressModel.find();
    const newData = await Promise.all( 
      
      ProgressData.map(async ({job_code,applied_by})=>{
      
      const singupModel = await SignUpModel.findById(applied_by)
      const {phoneNumber} = singupModel

      return {
        x : job_code,
        phoneNumber
        
      }
    }
    )
    )
    const getProfileDetails = await ProfileModel.find({contactNumber:phoneNumber})
    console.log(getProfileDetails)
    
    const xData = []
  
    // for(let i = 0;i<myData.length;i++){
    //   const ob = {}
    //   const name = myData[i].job_name
    //   if(figure.length>0){
    //   const figure = await Jobmodel.find({_id:name,posted_by:req.user._id})

    //     const queryKey = await PromoterProfileImages.findById(figure.job_images);
    //     ob.data = figure
    //     ob.status = myData[i].status
    //     ob.image = queryKey
    //     xData.push(ob)
    //   }
      
    // }

    res.status(200).send(newData);
  })
);


export default Progressrouter;
