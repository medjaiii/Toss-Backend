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

    const getUserData = await SignUpModel.exists({email:req.body.email})
    if (getUserData){
      const findUser = await SignUpModel.findOne({_id:getUserData._id})
      const getVerifiedStatus = findUser.isVerified
      
      if(getVerifiedStatus==="true"){
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser,{job_images:imageLink})
        res.status(200).send({
          updatedUser,
          token:generateToken(findUser)
        })        
      }else{
        await client.verify
        .services(SERVICE_SID)
        .verifications.create({
          to: `+${91}${req.body.phoneNumber}`,
          channel: "sms",
        });
        
        await SignUpModel.findOneAndUpdate({_id:getUserData._id},{"$set":{"name":req.body.name,"email": req.body.email,"phoneNumber":  req.body.phoneNumber,"currentLocation": req.body.currentLocation,'password': bcrypt.hashSync(req.body.password, 8),"job_images": getId
      }}).exec(function(err,user){
        console.log(user)
      })
        res.status(200).send({
            "message":`User is not verfied. OTP Code Sent!`
        })       
      }  
    }else{
      await User.save()
      await client.verify
      .services(SERVICE_SID)
      .verifications.create({
        to: `+${91}${req.body.phoneNumber}`,
        channel: "sms",
      });
  
      res.status(200).send({
          "message":`User Does Not Exists. OTP Code Sent!`  
      })
    }

  })
);

SignUpRouter.post("/signin",expressAsyncHandler(async (req,res)=>{

  // we cannot signup using username as UX is not available for username
  const findUser = await SignUpModel.findOne({email:req.body.email})
  if(findUser){
    if(bcrypt.compareSync(req.body.password,findUser.password)){
      console.log(findUser.isVerified==="true")
      if(findUser.isVerified==="true"){
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser,{job_images:imageLink})
        res.status(200).send({
          updatedUser,
          token:generateToken(findUser)
        })

      }else{
        res.status(500).send({
          "message":"User is not Verified. Please Verify"
        })
      }
      
    }else{
      res.status(500).send({"message":"Password Do not Match"})
    }
  }else{
    res.status(404).send({message:"Invalid Email or password"})
  }

})
)


export default SignUpRouter