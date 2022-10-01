import express from "express";
import expressAsyncHandler from "express-async-handler";
import ProfileModel from "../model/UserProfile.js";
import uploadFile from "../../../../Multer_config.js";
import UserProfileImages from "../model/UserImages.js";
import { option } from "../../../../DataBaseConstants.js";
import { isAuth } from "../../util.js";


const UserProfileRouter = express.Router();

UserProfileRouter.post("/addProfile",isAuth,uploadFile,
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
  "/editProfile/:id",isAuth,uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;
      
    await ProfileModel.findByIdAndUpdate(id,req.body,{useFindAndModify: false},option)
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
  "/editImages/:id",isAuth,uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;
    
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );
    UserProfileImages.findByIdAndUpdate(id,{userProfileImage:images},option)
    .then((data)=>{
      res.status(200).json(data)
    })
    .catch((err)=>{
      res.status(500).json({"message":err})
    })
    
  })
);

UserProfileRouter.get(
  "/delete/:id",uploadFile,
  expressAsyncHandler(async (req, res,next) => {
    const id = req.params.id;

    const resu = UserProfileImages.findById({ _id: id } )
    .then((data)=>{
        console.log(data)      
        res.send(resu)
    })
    .catch((err)=>{
      res.status(500).json({
        message:err
      })
    })
    // db.groups.update(
    //   {"_id": ObjectId("5a7da1bda21d5f3e8cf005b3")},
    //   {"$pull":{"group_members":{"faculty_number":{$in:[8025,7323]}}}}
    // )
    // Image.updateOne({ _id: req.params.id }, { $pull: { images: { image: imageName }} });

  
  })
);


export default UserProfileRouter;
