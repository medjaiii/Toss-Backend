import express from "express";
import expressAsyncHandler from "express-async-handler";

const EmailRouter = express.Router();

EmailRouter.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    res.send("test")
  })
);

Jobrouter.get(
  "/alljobs",
  expressAsyncHandler(async (req, res, next) => {
    const getalljobs = await Jobmodel.find();

    res.status(200).send(getalljobs);
  })
);


export default EmailRouter;
