import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import PromoterSignUpModel from "../model/PromoterSignUpModel.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import { generateToken } from "../../util.js";
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

    const promoterObject = Object.assign(req.body, {job_images: getId },{password:bcrypt.hashSync(req.body.password, 8)});

    const sinupModel = new PromoterSignUpModel(promoterObject);

    sinupModel
      .save()
      .then((data) => {
        res.status(200).json({
          id: data._id,
        });
      })
      .catch((err) => {
        res.status(500).json({ message: err });
      });
  })
);

PromoterSignup.post("/signin",expressAsyncHandler(async(req,res,next)=>{

  const findUser = await PromoterSignUpModel.findOne({work_email:req.body.email})
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
      

}))

export default PromoterSignup;
