import express from "express";
import expressAsyncHandler from "express-async-handler";
import SignUpModel from "../sign_up_api/model/SignUpModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv"
import nodemailer from "nodemailer"

const EmailRouter = express.Router();

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASSWORD
  }
});

/// forgot password api for the normal user

EmailRouter.post(
  "/sendMail",
  expressAsyncHandler(async (req, res) => {
    const mailOptions = {
      from: process.env.GMAIL_ID, // sender address
      to: req.body.email, // list of receivers
      subject: 'Forgot Password Mail From Toss Job Service', // Subject line
      html: `${process.env.HOST}/api/email/forgotpassword`
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err)
      else
        res.status(200).send({ "message": "Link Sent" })
    })

  })
);

EmailRouter.get(
  "/forgotpassword",
  expressAsyncHandler(async (req, res) => {
    res.render("form")
  })
);

EmailRouter.post(
  "/saved",
  expressAsyncHandler(async (req, res) => {
    const findUser = await SignUpModel.exists({ email: req.body.email })
    if (findUser) {
      if (req.body.password !== req.body.confirm_password) {
        res.status(400).send({ "message": "Password do not match" })
      } else {

        await SignUpModel.findOneAndUpdate({ "email": req.body.email }, { "password": bcrypt.hashSync(req.body.password, 8), }).exec(function (err, mess) {
          if (err) {
            res.status(400).send({ "message": err })
          } else {
            res.status(200).send({ "message": "Password Updated Successfully" })
          }
        })

      }
    } else {
      res.send("This User Does not exists. Please Create a Profile First")
    }
  })
);
////

/// forgot password api for the GENERAL
EmailRouter.post(
  "/sendMailPromoter",
  expressAsyncHandler(async (req, res) => {
    const mailOptions = {
      from: process.env.GMAIL_ID, // sender address
      to: req.body.email, // list of receivers
      subject: 'Forgot Password Mail From Toss Job Service', // Subject line
      html: `${process.env.HOST}/api/email/forgotpasswordPromoter`
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err)
      else
        res.status(200).send({ "message": "Link Sent" })
    })

  })
);

EmailRouter.get(
  "/forgotpasswordPromoter",
  expressAsyncHandler(async (req, res) => {
    res.render("formPromoter")
  })
);

EmailRouter.post(
  "/savedPromoter",
  expressAsyncHandler(async (req, res) => {
    const findUser = await PromoterSignUpModel.exists({ email: req.body.email })
    if (findUser) {
      if (req.body.password !== req.body.confirm_password) {
        res.status(400).send({ "message": "Password do not match" })
      } else {

        await PromoterSignUpModel.findOneAndUpdate({ "email": req.body.email }, { "password": bcrypt.hashSync(req.body.password, 8), }).exec(function (err, mess) {
          if (err) {
            res.status(400).send({ "message": err })
          } else {
            res.status(200).send({ "message": "Password Updated Successfully" })
          }
        })

      }
    } else {
      res.send("This User Does not exists. Please Create a Profile First")
    }
  })
);


export default EmailRouter;
