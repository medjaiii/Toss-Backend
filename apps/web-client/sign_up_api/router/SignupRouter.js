import bcrypt from "bcryptjs";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile from "../../../../Multer_config.js";
import { generateToken } from "../../util.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import SignUpModel from "../model/SignUpModel.js";
import { createRequire } from "module";
import dotenv from "dotenv"

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
        phoneNumber:  req.body.phoneNumber,
        currentLocation: req.body.currentLocation,
        password: bcrypt.hashSync(req.body.password, 8),
        job_images: getId
    });
 
    const createdUser = await User.save()

    const otpRes = await client.verify
    .services(SERVICE_SID)
    .verifications.create({
      to: `+${91}${req.body.phoneNumber}`,
      channel: "sms",
    });

    res.status(200).send({
        _id:createdUser.id,
        name:createdUser.name,
        token :generateToken(createdUser),
        "message":`User Entries Saved in Database. OTP Code Sent ! ${JSON.stringify(otpRes)}`

    })

  })
);

SignUpRouter.post("/signin",expressAsyncHandler(async (req,res)=>{

  // we cannot signup using username as UX is not available for username
  const findUser = await SignUpModel.findOne({email:req.body.email})
  if(findUser){
    if(bcrypt.compareSync(req.body.password,findUser.password)){
      const imageLink = await PromoterProfileImages.findById(findUser.job_images)
      const updatedUser = Object.assign(findUser,{job_images:imageLink})
      res.status(200).send({
        updatedUser,
        token:generateToken(findUser)
      })
      return
    }
  }
  res.status(404).send({message:"Invalid Email or password"})

})
)


export default SignUpRouter