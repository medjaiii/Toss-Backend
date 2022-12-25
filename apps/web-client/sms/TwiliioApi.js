import express from "express";
import { createRequire } from "module";
import dotenv from "dotenv"
import SignUpModel from "../sign_up_api/model/SignUpModel.js";

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

const SmsRouter = express.Router();

SmsRouter.post("/sendsms", async (req, res) => {
  const number = Math.floor(100000 + Math.random() * 900000);
  const { phone } = req.body;

  const welcomeMessage = `Welcome! Your verification code is ${number}`;

  const otpRes = await client.verify
    .services(SERVICE_SID)
    .verifications.create({
      to: `+${91}${phone}`,
      channel: "sms",
    });
  
  res.status(200).send({
    message: `Code Sent ! ${JSON.stringify(otpRes)}`,
  });
});

SmsRouter.post("/verify", async (req, res) => {
  // const number = Math.floor(100000 + Math.random() * 900000)
  const { phone, otp } = req.body;

  // const welcomeMessage = `Welcome! Your verification code is ${number}`;

  await client.verify
    .services(SERVICE_SID)
    .verificationChecks.create({
      to: `+${91}${phone}`,
      code: otp,
    })

    .then(async (data) => {
      console.log(data);
      if (data.status === "approved") {
        await SignUpModel.findOneAndUpdate({phoneNumber:data.to.slice(3,13)},{"isVerified":true}).exec(function(err,dta){
          if(err){
            console.log(err)
          }else{
            console.log(dta)
          }
        })

        res.status(200).send({
          message: `Otp Verfied Successfully `,
        });
      } else {
        res.status(400).send({
          message: `Invalid Otp`,
        });
      }
    });
});

export default SmsRouter;
