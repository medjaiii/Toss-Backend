import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASSWORD
  }
});

const mailOptions = {
  from: process.env.GMAIL_ID, // sender address
  to: 'princebhatia09@gmail.com', // list of receivers
  subject: 'test mail', // Subject line
  html: '<h1>this is a test mail.</h1>'// plain text body
};

transporter.sendMail(mailOptions, function (err, info) {
  if(err)
      console.log(err)
  else
      console.log(info);
})