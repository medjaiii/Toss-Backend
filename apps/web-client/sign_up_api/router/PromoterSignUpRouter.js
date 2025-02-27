import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import PromoterSignUpModel from "../model/PromoterSignUpModel.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import { generatePromoterToken, isAdminAuth, isPromoterAuth } from "../../util.js";
import uploadFile from "../../../../Multer_config.js";

const PromoterSignup = express.Router();

PromoterSignup.post(
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

    const promoterObject = Object.assign(req.body, { job_images: getId }, { password: bcrypt.hashSync(req.body.password, 8) });

    if (req.body.firebaseToken) {
      promoterObject.firebaseToken = req.body.firebaseToken;
    }

    const sinupModel = new PromoterSignUpModel(promoterObject);

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

PromoterSignup.post("/signin", expressAsyncHandler(async (req, res, next) => {

  const findUser = await PromoterSignUpModel.findOne({ work_email: req.body.email })
  if (findUser) {
    if (bcrypt.compareSync(req.body.password, findUser.password)) {
      if (req.body.firebaseToken) {
        // Update the firebaseToken if it's provided in the request
        findUser.firebaseToken = req.body.firebaseToken;
        await findUser.save(); // Save the updated user with the new firebaseToken
      }
      const imageLink = await PromoterProfileImages.findById(findUser.job_images)
      const updatedUser = Object.assign(findUser, { job_images: imageLink })

      res.status(200).send({
        updatedUser,
        token: generatePromoterToken(updatedUser)
      })
      return
    } else {
      res.status(400).send({ message: "Invalid Email or password" })
    }
  } else {
    res.status(404).send({ message: "User not found" })
  }
}))

PromoterSignup.post("/forgotpasswod", expressAsyncHandler(async (req, res, next) => {

  const findUser = await PromoterSignUpModel.findOne({ work_email: req.body.email })
  if (findUser) {
    if (bcrypt.compareSync(req.body.password, findUser.password)) {
      const imageLink = await PromoterProfileImages.findById(findUser.job_images)
      const updatedUser = Object.assign(findUser, { job_images: imageLink })

      res.status(200).send({
        updatedUser,
        token: generatePromoterToken(findUser)
      })
      return
    }
  }
  res.status(404).send({ message: "Invalid Email or password" })


}))


PromoterSignup.get("/getpromotersign", isPromoterAuth, expressAsyncHandler(async (req, res, next) => {
  const findUser = await PromoterSignUpModel.findOne({ work_email: req.user.email })
  if (findUser) {
    const imageLink = await PromoterProfileImages.findById(findUser.job_images)
    const updatedUser = Object.assign(findUser, { job_images: imageLink })

    res.status(200).send({
      updatedUser,
    })
    return
  }
  res.status(200).send({ message: "Invalid Email or password" })

}))

PromoterSignup.get("/getallpromoters", isAdminAuth, expressAsyncHandler(async (req, res, next) => {
  PromoterSignUpModel.find({}).populate("job_images").exec((err, profiles) => {
    if (err) {
      res.send(err)
    } else {
      res.status(200).send(profiles)
    }
  })

}))

PromoterSignup.put(
  "/editPromoterbyAdmin",
  isAdminAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body)
    await PromoterSignUpModel.updateOne({ _id: req.body.userid }, req.body.data)
      .then(data => {
        res.status(200).send({ "message": "Promoter Updated" })
      })
      .catch((err) => {
        res.status(400).send({ "message": "User does not exists or id mis-match" })
      })
  })
)

PromoterSignup.delete("/deletepromoter", isAdminAuth, expressAsyncHandler(async (req, res) => {
  console.log(">>", req.body)
  const job = await PromoterSignUpModel.findById(req.body.userid)
  res.send(job)
  // if (!job) {
  //   res.status(400).send({"message":'User not found'});
  // }else{
  //   console.log(job)
  //   await job.remove()
  //   res.status(200).send({"message":"Promoter Deleted"})
  // }

}))
export default PromoterSignup;
