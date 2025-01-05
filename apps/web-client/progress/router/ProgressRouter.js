import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile from "../../../../Multer_config.js";
import AppliedModel from "../../job/model/AppliedModel.js";
import Jobmodel from "../../job/model/JobModel.js";
import UserProfileImages from "../../profile/model/UserImages.js";
import ProfileModel from "../../profile/model/UserProfile.js";
import PromoterProfileImages from "../../sign_up_api/model/PromoterImagesModel.js";
import SignUpModel from "../../sign_up_api/model/SignUpModel.js";
import { isAdminAuth, isAuth, isPromoterAuth } from "../../util.js";
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

    const getAppliedJobs = await AppliedModel.find({ "user_by": req.user._id, "jobs": req.body.Extension.jobs })
    if (getAppliedJobs.length > 0) {
      res.status(400).send({ "message": "You Cannot Apply on Same Job Again." })
      return
    }

    const Job = await Jobmodel.findById(req.body.Extension.jobs)

    if (Job.job_status === "Disable") {
      res.status(400).send({ "message": "You Cannot Apply on Closed Job." })
    } else {

      const extenObject = Object.assign(req.body.Extension, {
        user_by: getloggedInUser._id, job_status: "Applied", posted_by: Job.posted_by, price: Job.payment
      });

      const applied = new AppliedModel(extenObject);
      applied.save()
        .then((data) => {
          res.status(200).send(data);
        })
        .catch((err) => {
          res.status(400).send({ "message": "Bad Request" });
        });
    }

  })
);

Progressrouter.put(
  "/editJobStatus",
  isPromoterAuth,
  expressAsyncHandler(async (req, res) => {
    const { job_id, status, user_id } = req.body;

    if (status === "Completed") {
      AppliedModel.updateMany({ status: "Approved", jobs: job_id }, { $set: { job_status: "Completed" } }, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({ "Status": "Job Completed" })
        }
      });
    } else {
      try {
        var findUser = await SignUpModel.findOne({ _id: user_id })
      } catch (error) {
        res.status(400).send({ "message": "User Does not exists" })
      }

      await AppliedModel.updateOne({ jobs: job_id, user_by: user_id }, {

        $set: {
          job_status: status, status: "Approved"
        }
      })
        .then(async (data) => {
          // res.status(200).send("ok")
          await ProfileModel.updateOne({ contactNumber: findUser.phoneNumber }, { "approvedStatus": "Approved" })
            .then(data => {
              res.status(200).send({ "message": "User Approved and Job status Updated" })
            })
            .catch((err) => {
              res.status(400).send({ "message": "User does not exists or id mis-match" })
            })
        })
        .catch((err) => {
          res.status(400).send(err)
        })
    }



    //   { _id: object_id, "job_code.job_name": job_id },

    //   {
    //     $set: {
    //       "job_code.$.status": status,
    //     },
    //   },
    //   { multi: true }
    // );

    // res.status(200).send(saveProgess);
  })
);

Progressrouter.put(
  "/editPostedJobStatus",
  isPromoterAuth,
  expressAsyncHandler(async (req, res) => {
    const { job_id, status, user_id } = req.body;

    if (status === "Completed") {
      // await Jobmodel.updateOne({ _id: req.body.userid }, req.body.data)
      Jobmodel.updateOne({ _id: job_id }, { $set: { job_status: "Completed" } }, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({ "Status": "Job Completed" })
        }
      });
    } else {
      Jobmodel.updateOne({ _id: job_id }, { $set: { job_status: status } }, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({ "Status": "Job " + status })
        }
      });
    }



    //   { _id: object_id, "job_code.job_name": job_id },

    //   {
    //     $set: {
    //       "job_code.$.status": status,
    //     },
    //   },
    //   { multi: true }
    // );

    // res.status(200).send(saveProgess);
  })
);

Progressrouter.get(
  "/jobstatus",
  isAuth,
  expressAsyncHandler(async (req, res) => {

    const getloggedInUser = await SignUpModel.findOne({
      email: req.user.email,
    });

    const dta = await AppliedModel.find({ user_by: getloggedInUser._id })

    const findalData = await Promise.all(dta.map(async (dtaa) => {

      const job = await Jobmodel.findById(dtaa.jobs)
      return {
        job,
        status: dtaa.job_status
      }

    }))


    res.status(200).send(findalData);
  })
);

Progressrouter.get(
  "/allpromoterjobs",
  isPromoterAuth,
  expressAsyncHandler(async (req, res) => {

    // try {
    //   const jobs = await Jobmodel.find({ posted_by: req.user._id, job_status:{$ne:"Disable"} }).lean(); // Find all jobs posted by "abc"
    //   const jobIds = jobs.map((job) => job._id); // Get the job IDs
    //   console.log(jobIds)      
    //   const appliedJobs = await AppliedModel.find({
    //     jobs: { $in: jobIds }, // Find applied jobs where jobs field is in the jobIds array
    //   }).populate({
    //     path: "jobs",
    //     model: "Jobmodel",
    //   });

    //   const jobData = _.chain(jobs)
    //   .leftOuterJoin(appliedJobs, "_id", "jobs._id")
    //   .map((item) => ({
    //     job: item.jobs ? item.jobs : item,
    //     job_status: item.jobs ? item.job_status : null,
    //   }))
    //   .value();

    //   res.status(200).send(jobData);
    // } catch (error) {
    //   console.error(error);
    // }

    const PromoterAllJobs = await Jobmodel.find({ posted_by: req.user._id, job_status: { $ne: "Disable" } });
    res.status(200).send(PromoterAllJobs);

  }))

Progressrouter.post(
  "/promoterAppliedJobsByUser",
  isPromoterAuth,
  expressAsyncHandler(async (req, res) => {
    const Allied_Data = await AppliedModel.find({ jobs: req.body.jobid, posted_by: req.user._id });
    console.log(Allied_Data)
    const arrX = await Promise.all(
      Allied_Data.map(async (data) => {
        const SignUpDetails = await SignUpModel.findById(data.user_by);
        console.log(SignUpDetails);

        try {

          var IDmodel = await ProfileModel.findOne({ contactNumber: SignUpDetails.phoneNumber })
        } catch (error) {
          var IDmodel = "No profile is created. Please create one first."
        }

        try {
          var getImages = await UserProfileImages.findById(IDmodel.profileImages)

        } catch (error) {
          var getImages = "no images"
        }

        if (IDmodel === null || IDmodel === undefined) {
          var IDmodel = "No profile is created. Please create one first."
        }

        const image = await PromoterProfileImages.findById(SignUpDetails.job_images)
        const front_image = image && image.promoterImages[0]
        const userProfile = Object.assign(IDmodel, { profileImages: getImages })

        return {
          user_approved: data.status,
          SignUpDetails,
          userProfile,
          front_image
        };
      })
    );

    res.send(arrX);
  })
);

Progressrouter.get(
  "/promoterAllJobsStatus",
  isPromoterAuth,
  expressAsyncHandler(async (req, res) => {
    const postedBY = await AppliedModel.find({ posted_by: req.user._id })

    const findalData = await Promise.all(postedBY.map(async (data) => {

      const job = await Jobmodel.findById(data.jobs).lean().exec()
      const newJob = Object.assign(job, { "status": data.job_status })

      return {
        newJob
      }

    })

    );
    res.send(findalData);
  }))

Progressrouter.get(
  "/totalearning",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    AppliedModel.aggregate([
      {
        $match: {
          job_status: 'Completed',
          user_by: req.user._id
        }
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: { $toInt: "$price" } },
          totalCount: { $sum: 1 }

        }
      }
    ])
      .then(result => {
        if (result.length > 0) {
          const totalPrice = result[0].totalPrice;
          const totalCount = result[0].totalCount;
          res.status(200).json({ "Total_Price": totalPrice, "Total_Completed_Jobs": totalCount })
        } else {
          res.status(200).json({ "Total_Price": 0, "Total_Completed_Jobs": 0 })

        }
      })
      .catch(error => {
        res.status(400).send(error)
      });

  })
);

Progressrouter.put(
  "/editJobStatusbyadmin",
  isAdminAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body)
    await Jobmodel.updateOne({ _id: req.body.userid }, req.body.data)
      .then(data => {
        res.status(200).send({ "message": "User Approved and Job status Updated" })
      })
      .catch((err) => {
        res.status(400).send({ "message": "User does not exists or id mis-match" })
      })
  })

  //   { _id: object_id, "job_code.job_name": job_id },

  //   {
  //     $set: {
  //       "job_code.$.status": status,
  //     },
  //   },
  //   { multi: true }
  // );

  // res.status(200).send(saveProgess);
);

export default Progressrouter;
