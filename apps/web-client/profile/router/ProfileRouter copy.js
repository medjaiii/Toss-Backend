import express from "express";
import expressAsyncHandler from "express-async-handler";
import ProfileModel from "../model/UserProfile.js";
import uploadFile from "../../../../Multer_config.js";
import UserProfileImages from "../model/UserImages.js";

const UserProfileRouter = express.Router();

UserProfileRouter.post("/addProfile",
  expressAsyncHandler(async (req, res, next) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );

    console.log(req.body)
    const userImages = new UserProfileImages({
      userProfileImage: images,
    });

    const getUserid = (await userImages.save())._id;

    const UserProfile = new ProfileModel({
      fullname: req.body.fullname,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      city: req.body.city,
      area: req.body.area,
      about: req.body.about,
      previousExpereince: req.body.previousExpereince,
      skills: req.body.skills,
      profileImages: getUserid,
    });

    const saveProfile = await UserProfile.save();
    if (saveProfile) {
      res.status(200).json({
        id: saveProfile._id,
        message: "Saved",
      });
    }
  })
);

UserProfileRouter.patch(
  "/editProfile/:id",
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;
    const getUser = await ProfileModel.findByIdAndUpdate(id,req.body,{useFindAndModify: false})
    .then(data=>{
        if(!data){
            res.status(404).send({
                message:"Cannot Update"
            })
        }else{
            res.status(200).send({message:"Success"})
        }
    })
    .catch(err=>{
        res.status(500).send({
            messag:"Some Error Occured"
        })
    })
    
    
  })
);

export default UserProfileRouter;
