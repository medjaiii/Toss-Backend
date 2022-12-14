import express from "express";
import SendSms from "../../../twillioSmsApi.js";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

var Twilio = require("twilio");
let TWILIO_ACCOUNT_SID = "AC75105ba91337e37d72ec7398551bbb28";
let TWILIO_AUTH_TOKEN = "1a2ac9916a2b16c4c8296e1d1729aa20";
let TWILIO_PHONE_NUMBER = "+19787486909";
let SERVICE_SID = "VA4faaf6f9017f806704d8af242b074830";

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

SmsRouter.post("/verify", (req, res) => {
  // const number = Math.floor(100000 + Math.random() * 900000)
  const { phone, otp } = req.body;

  // const welcomeMessage = `Welcome! Your verification code is ${number}`;

  client.verify
    .services(SERVICE_SID)
    .verificationChecks.create({
      to: `+${91}${phone}`,
      code: otp,
    })

    .then((data) => {
      console.log(data.status);
      if (data.status === "approved") {
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
