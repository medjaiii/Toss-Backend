import express from "express";
import expressAsyncHandler from "express-async-handler";
import {
  generateAdminToken,
  generatePromoterToken,
  isPromoterAuth,
} from "../../util.js";
import AdminSignupModel from "../model/AdminModel.js";

const AdminSignup = express.Router();

AdminSignup.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const sinupModel = new AdminSignupModel(req.body);

    sinupModel
      .save()
      .then((data) => {
        res.status(200).json({
          id: data._id,
        });
      })
      .catch((err) => {
        res.status(400).json({ message: err });
      });
  })
);

AdminSignup.post(
  "/signin",
  expressAsyncHandler(async (req, res, next) => {
    const findUser = await AdminSignupModel.findOne({ email: req.body.email });
    try{
      if (findUser.password === req.body.password) {
        res
          .status(200)
          .send({ message: "Admin Login", token: generateAdminToken(findUser) });
        res.end();
      } else {
        res.status(400).send({ message: "Incorrect Password" });
        res.end();
      }
      
    }catch(err){
      res.status(400).send({ message: "Admin Not Found" });
      res.end();
    }
  })
);

export default AdminSignup;
