import bcrypt from "bcryptjs";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile, { handleIntroVideoUpload } from "../../../../Multer_config.js";
import { generateToken, isAuth } from "../../util.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import PromoterProfileVideo from "../model/PromoterVideosModel.js";
import SignUpModel from "../model/SignUpModel.js";
import { createRequire } from "module";
import dotenv from "dotenv"
import ProfileModel from "../../profile/model/UserProfile.js";
import UserProfileImages from "../../profile/model/UserImages.js";
import mongoose from "mongoose"
import { option } from "../../../../DataBaseConstants.js";

dotenv.config()


const require = createRequire(import.meta.url);
var Twilio = require("twilio");
let TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
let TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
let TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
let SERVICE_SID = process.env.SERVICE_SID

const accountSid = TWILIO_ACCOUNT_SID;

const authToken = TWILIO_AUTH_TOKEN;

const client = new Twilio(accountSid, authToken);

const SignUpRouter = express.Router();

SignUpRouter.post(
  "/signup",
  uploadFile,
  expressAsyncHandler(async (req, res) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );
    const userImages = new PromoterProfileImages({
      promoterImages: images,
    });

    const getId = (await userImages.save())._id;

    const User = new SignUpModel({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      currentLocation: req.body.currentLocation,
      password: bcrypt.hashSync(req.body.password, 8),
      job_images: getId
    });

    const userProfileImages = new UserProfileImages({
      userProfileImage: images,
    });

    const getUerId = (await userProfileImages.save())._id;

    const UserProfile = new ProfileModel({
      fullname: req.body.name,
      email: req.body.email,
      area: req.body.currentLocation ? req.body.currentLocation : "",
      contactNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
      city: req.body.currentLocation ? req.body.currentLocation : "",
      about: req.body.about ? req.body.about : "",
      previousExpereince: req.body.previousExpereince ? req.body.previousExpereince : "",
      skills: req.body.skills ? req.body.skills : [],
      height: req.body.height ? req.body.height : "",
    });

    const saveProfile = await UserProfile.save();

    const getUserData = await SignUpModel.exists({ email: req.body.email })
    if (getUserData) {
      const findUser = await SignUpModel.findOne({ _id: getUserData._id })
      const getVerifiedStatus = findUser.isVerified

      if (getVerifiedStatus === "true") {
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser, { job_images: imageLink })
        res.status(200).send({
          updatedUser,
          saveProfile,
          token: generateToken(findUser)
        })
      } else {
        await client.verify
          .services(SERVICE_SID)
          .verifications.create({
            to: `+${91}${req.body.phoneNumber}`,
            channel: "sms",
          });

        await SignUpModel.findOneAndUpdate({ _id: getUserData._id }, {
          "$set": {
            "name": req.body.name, "email": req.body.email, "phoneNumber": req.body.phoneNumber, "currentLocation": req.body.currentLocation, 'password': bcrypt.hashSync(req.body.password, 8), "job_images": getId
          }
        }).exec(function (err, user) {
          console.log(user)
        })
        res.status(200).send({
          "message": `User is not verfied. OTP Code Sent!`
        })
      }
    } else {
      await User.save()
      await client.verify
        .services(SERVICE_SID)
        .verifications.create({
          to: `+${91}${req.body.phoneNumber}`,
          channel: "sms",
        });

      res.status(200).send({
        "message": `User Does Not Exists. OTP Code Sent!`
      })
    }

  })
);

SignUpRouter.post("/signin", expressAsyncHandler(async (req, res) => {

  // we cannot signup using username as UX is not available for username
  const findUser = await SignUpModel.findOne({ email: req.body.email })
  if (findUser) {
    if (bcrypt.compareSync(req.body.password, findUser.password)) {
      console.log(findUser.isVerified === "true")
      if (findUser.isVerified === "true") {
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser, { job_images: imageLink })

        res.status(200).send({
          updatedUser,
          token: generateToken(findUser)
        })

      } else {
        res.status(400).send({
          "message": "User is not Verified. Please Verify"
        })
      }

    } else {
      res.status(400).send({ "message": "Password Do not Match" })
    }
  } else {
    res.status(400).send({ message: "Account not found. Please check your credentials" })
  }

})
)

SignUpRouter.delete("/deleteimage/:id", isAuth, expressAsyncHandler(async (req, res) => {
  const id = req.params.id
  const findUser = await SignUpModel.findOne({ _id: req.user._id })
  await PromoterProfileImages.findOneAndUpdate({ _id: findUser.job_images }, { "$pull": { "promoterImages": { _id: id } } }, { safe: true, multi: false })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      res.status(400).json({ "message": err })
    })
}))

SignUpRouter.put(
  "/editImages", isAuth, uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );

    const findUser = await SignUpModel.findOne({ _id: req.user._id })

    await PromoterProfileImages.findOneAndUpdate({ _id: findUser.job_images }, { "$push": { promoterImages: images } }, option)
      .then((data) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        res.status(400).json({ "message": err })
      })
  })
);

// SignUpRouter.put(
//   "/editIntroVideo", isAuth, uploadFile,
//   expressAsyncHandler(async (req, res, next) => {
//     const introVideo = req.files[0].location;

//     const findUser = await SignUpModel.findOne({ _id: req.user._id });

//     await PromoterProfileVideo.findOneAndUpdate(
//       { _id: findUser.job_images },
//       {
//         $set: { introVideo },
//         $setOnInsert: { introVideo } // Create the field if it doesn't exist
//       },
//       option
//     )
//       .then((data) => {
//         res.status(200).json(data);
//       })
//       .catch((err) => {
//         res.status(400).json({ "message": err });
//       });
//   })
// );

SignUpRouter.put(
  "/editIntroVideo", isAuth, handleIntroVideoUpload,
  expressAsyncHandler(async (req, res, next) => {
    const introVideo = req.files[0].location; // Assuming this is the video URL

    try {
      const findUser = await SignUpModel.findOne({ _id: req.user._id });

      const updatedVideo = await PromoterProfileVideo.findOneAndUpdate(
        { _id: findUser.intro_video }, // Assuming job_images is the reference to the PromoterProfileVideo
        {
          $set: { promoterVideo: introVideo } // Update promoterVideo field
        },
        { new: true, upsert: true } // `new: true` returns the updated doc, `upsert: true` creates if doesn't exist
      );

      res.status(200).json(updatedVideo);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
);




export default SignUpRouter