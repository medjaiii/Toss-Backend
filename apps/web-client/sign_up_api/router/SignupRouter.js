import bcrypt from "bcryptjs";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile from "../../../../Multer_config.js";
import { generateToken } from "../../util.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import SignUpModel from "../model/SignUpModel.js";

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

    res.status(200).send({
        _id:createdUser.id,
        name:createdUser.name,
        token :generateToken(createdUser),
        "message":"User Created Successfully"
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