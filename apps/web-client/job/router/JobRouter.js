import express from "express";
import expressAsyncHandler from "express-async-handler";
import Jobmodel from "../model/JobModel.js";
import uploadFile from "../../../../Multer_config.js";
import PromoterProfileImages from "../../sign_up_api/model/PromoterImagesModel.js";
import { isAuth } from "../../util.js";

const Jobrouter = express.Router();

Jobrouter.post(
  "/new",
  isAuth,
  uploadFile,
  expressAsyncHandler(async (req, res) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );
    const userImages = new PromoterProfileImages({
      promoterImages: images,
    });
    
    // const DateObject = {
    //   duration:{
    //     startDuration:dayjs(req.body.duration.startDuration, "HH:mm:ss").format("HH:mm:ss"),
    //     endDuration:dayjs(req.body.duration.endDuration,"HH:mm:ss").format("HH:mm:ss")
    //   }
    // }

    const getId = (await userImages.save())._id;
    const jobObject = Object.assign(req.body, { job_images: getId,posted_by:req.user });

    const jobmodel = new Jobmodel(jobObject);

    jobmodel
      .save()
      .then((data) => {
        res.status(200).json({
          id: data._id,
        });
      })
      .catch((err) => {
        res.status(500).json({ message: err });
      });
  })
);

Jobrouter.get(
  "/alljobs",
  expressAsyncHandler(async (req, res, next) => {
    const getalljobs = await Jobmodel.find();

    const mydata = await Promise.all(
      getalljobs.map(
        async ({
          _id,
          job_images,
          payment,
          job_name,
          recepient,
          company_Name,
          description,
          requirement,
          workers,
          address,
          pincode,
          createdDate,
          duration,
        }) => {
          const queryKey = await PromoterProfileImages.findById(job_images);
          return {
            id: _id,
            name: job_name,
            description: description,
            recepient: recepient,
            company_Name: company_Name,
            requirement: requirement,
            workers: workers,
            address: address,
            pincode: pincode,
            duration: duration,
            payment: payment,
            createdDate: createdDate,
            image: queryKey.promoterImages[0]["name"],
          };
        }
      )
    );

    res.status(200).send(mydata);
  })
);

Jobrouter.get(
  "/promoterjobs",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    console.log(req.user._id)
  
    const getalljobs = await Jobmodel.find({posted_by:req.user._id});
    const mydata = await Promise.all(
      getalljobs.map(
        async ({
          _id,
          job_images,
          payment,
          job_name,
          recepient,
          company_Name,
          description,
          requirement,
          workers,
          address,
          pincode,
          createdDate,
          duration,
          posted_by
        }) => {
          const queryKey = await PromoterProfileImages.findById(job_images);
          return {
            id: _id,
            name: job_name,
            description: description,
            recepient: recepient,
            company_Name: company_Name,
            requirement: requirement,
            workers: workers,
            address: address,
            pincode: pincode,
            duration: duration,
            payment: payment,
            posted_by:posted_by,
            createdDate: createdDate,
            image: queryKey.promoterImages[0]["name"],
          };
        }
      )
    );

    res.status(200).send(mydata);
  })
);

export default Jobrouter;
