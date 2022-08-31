import express from "express";
import expressAsyncHandler from "express-async-handler";
import ProfileModel from "../model/UserProfile.js";
import uploadFile from "../../../../Multer_config.js";
import UserProfileImages from "../model/UserImages.js";

const UserProfileRouter = express.Router();

UserProfileRouter.post("/addProfile",uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );

    const userImages = new UserProfileImages({
      userProfileImage: images,
    });

    const getUserid = (await userImages.save())._id;

    const UserProfile = new ProfileModel({
      fullname: req.body.fullname,
      email: req.body.email,
      area: req.body.area,
      contactNumber: req.body.contactNumber,
      city: req.body.city,
      about: req.body.about,
      previousExpereince: req.body.previousExpereince,
      skills: req.body.skills,
      profileImages: getUserid,
    });

    const saveProfile = await UserProfile.save();
    if (saveProfile) {
      res.status(200).json({
        id: saveProfile._id,
        imageId:saveProfile.profileImages,
        message: "Saved"
      });
    }
  })
);

UserProfileRouter.patch(
  "/editProfile/:id",uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;
      
    await ProfileModel.findByIdAndUpdate(id,req.body,{useFindAndModify: false})
    .then(data=>{
        if(!data){
            res.status(404).send({
                message:"Cannot Update"
            })
        }else{
            res.status(200).send({message:`Success. Updated ID is ${id}`})
        }
    })
    .catch(err=>{
        res.status(500).send({
            messag:"Some Error Occured"
        })
    })
    
    
  })
);

UserProfileRouter.put(
  "/editImages/:id",uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;
    
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );
    await UserProfileImages.findByIdAndUpdate(id,{userProfileImage:images},{useFindAndModify:false})
    .then((data)=>{
      if(!data){
        res.status(404).send({
            message:"Cannot Update"
        })
    }else{
        res.status(200).send({message:`Success. Updated ID is ${data}`})
    }
    })
    .catch((err)=>{
      res.status(500).send({message:err})
    })

    
  })
);

UserProfileRouter.get(
  "/delete/:id",uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;

    const resu = UserProfileImages.findById({ _id: req.params.id } )
    .then((data)=>{
        console.log(data)      
    })
    res.send(resu)
  
  })
);


export default UserProfileRouter;
