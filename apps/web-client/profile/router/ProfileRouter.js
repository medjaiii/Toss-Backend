import express from "express";
import expressAsyncHandler from "express-async-handler";
import ProfileModel from "../model/UserProfile.js";
import uploadFile from "../../../../Multer_config.js";
import UserProfileImages from "../model/UserImages.js";
import { option } from "../../../../DataBaseConstants.js";
import { isAdminAuth, isAuth, isPromoterAuth } from "../../util.js";
import UserSkillModel from "../model/UserSkills.js";
import SignUpModel from "../../sign_up_api/model/SignUpModel.js";
import PromoterProfileImages from "../../sign_up_api/model/PromoterImagesModel.js";


const UserProfileRouter = express.Router();

UserProfileRouter.post("/addProfile", isAuth, uploadFile,
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
        imageId: saveProfile.profileImages,
        message: "Saved"
      });
    }
  })
);

UserProfileRouter.put(
  "/editProfile", isAuth, uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    console.log(req.user)
    await ProfileModel.updateOne({ contactNumber: req.user.phoneNumber }, req.body, option)
      .then(data => {
        res.send("saved")
      })
      .catch((err) => {
        res.send(err)
      })
  })
);

UserProfileRouter.put(
  "/editImages", isAuth, uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );

    const userProfileImages = new UserProfileImages({
      userProfileImage: images,
    });

    const profile = await ProfileModel.findOne({ "contactNumber": req.user.phoneNumber }).lean().exec()

    if (profile.hasOwnProperty('profileImages') === false || profile.hasOwnProperty('profileImages') === null) {

      const getUerId = (await userProfileImages.save())._id;
      await ProfileModel.findOneAndUpdate({ contactNumber: req.user.phoneNumber }, { profileImages: getUerId }, option)
        .then((data) => {
          res.status(200).json(data)
        })
        .catch((err) => {
          res.status(400).json({ "message": err })
        })

    } else {
      await UserProfileImages.findOneAndUpdate({ _id: profile.profileImages }, { "$push": { userProfileImage: images } }, option)
        .then((data) => {
          res.status(200).json(data)
        })
        .catch((err) => {
          res.status(400).json({ "message": err })
        })
    }

    // UserProfileImages.findOneAndUpdate({_id:profile.profileImages},{"$push":{userProfileImage:images}},option)
    //   .then((data)=>{
    //     res.status(200).json(data)
    //   })
    //   .catch((err)=>{
    //     res.status(400).json({"message":err})
    //   })            
    //   const getUerId = (await userProfileImages.save())._id;
    //   await ProfileModel.findOneAndUpdate({contactNumber:req.user.phoneNumber},{profileImages:getUerId},option )
    //   .then((data)=>{
    //     res.status(200).json(data)
    //   })
    //   .catch((err)=>{
    //     res.status(400).json({"message":err})
    //   })

    // UserProfileImages.findOneAndUpdate({_id:id,"userProfileImage._id":req.body.key},{"$set":{"userProfileImage.$.name":images[0]["name"]}},option)

    // UserProfileImages.findOneAndUpdate(id,{"$push":{userProfileImage:images}},option)
    // .then((data)=>{
    //   res.status(200).json(data)
    // })
    // .catch((err)=>{
    //   res.status(400).json({"message":err})
    // })

  }))
UserProfileRouter.delete("/deleteImages/:id", isAuth, expressAsyncHandler(async (req, res) => {

  const id = req.params.id

  const fetchProfile = await ProfileModel.findOne({ "contactNumber": req.user.phoneNumber })

  await UserProfileImages.findOneAndUpdate({ _id: fetchProfile.profileImages }, { "$pull": { "userProfileImage": { _id: id } } }, { safe: true, multi: false })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      res.status(400).json({ "message": err })
    })

}))

UserProfileRouter.delete(
  "/delete/:id", uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const resu = UserProfileImages.findById({ _id: id })
      .then((data) => {
        console.log(data)
        res.send(resu)
      })
      .catch((err) => {
        res.status(400).json({
          message: err
        })
      })
    // db.groups.update(
    //   {"_id": ObjectId("5a7da1bda21d5f3e8cf005b3")},
    //   {"$pull":{"group_members":{"faculty_number":{$in:[8025,7323]}}}}
    // )
    // Image.updateOne({ _id: req.params.id }, { $pull: { images: { image: imageName }} });


  })
);

UserProfileRouter.get("/userprofile", isAuth, uploadFile, expressAsyncHandler(async (req, res, next) => {
  try {

    var IDmodel = await ProfileModel.findOne({ contactNumber: req.user.phoneNumber }).lean().exec()
  } catch (error) {
    var IDmodel = "No profile is created. Please create one first."
  }

  try {
    var getImages = await UserProfileImages.findById(IDmodel.profileImages)

  } catch (error) {
    var getImages = "no images"
  }

  if (IDmodel === null || IDmodel === undefined) {
    var IDmodel = "No profile is created. Please create one first."
  }

  const findUser = await SignUpModel.findOne({ _id: req.user._id })

  const imageLink = await PromoterProfileImages.findById(findUser.job_images)

  const userProfile = Object.assign(IDmodel, { profileImages: getImages })

  const news = Object.assign(userProfile, { "FrontImage": imageLink.promoterImages })

  res.status(200).send(news)

}))

UserProfileRouter.get("/getuserprofileforpromoter", isPromoterAuth, uploadFile, expressAsyncHandler(async (req, res, next) => {

  try {

    var IDmodel = await ProfileModel.findOne({ contactNumber: req.body.number })
  } catch (error) {
    var IDmodel = "No profile is created. Please create one first."
  }

  try {
    var getImages = await UserProfileImages.findById(IDmodel.profileImages)

  } catch (error) {
    var getImages = "no images"
  }

  if (IDmodel === null || IDmodel === undefined) {
    var IDmodel = "No profile is created. Please create one first."
  }

  const userProfile = Object.assign(IDmodel, { profileImages: getImages })
  res.status(200).send(userProfile)

}))

UserProfileRouter.post(
  "/postSkills",
  expressAsyncHandler(async (req, res, next) => {
    const skills = await UserSkillModel({ skills: req.body.skills })
    skills.save()
    res.send({ "message": "Skills Saved" })

  }))

UserProfileRouter.get(
  "/getSkills",
  expressAsyncHandler(async (req, res, next) => {
    const skills = await UserSkillModel.findById("651e8c04ddc1edfe6c4bf8b0")
    res.json(skills)
  }))

UserProfileRouter.put(
  "/updateSkills",
  expressAsyncHandler(async (req, res, next) => {
    const id = "6469d08f21b507a05daa3ddb"
    const { skills } = req.body;

    try {
      const profile = await UserSkillModel.findByIdAndUpdate(
        id,
        { skills },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(profile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }))

UserProfileRouter.get("/allusers", isAdminAuth, expressAsyncHandler(async (req, res, next) => {

  ProfileModel.find({}).populate("profileImages").exec((err, profiles) => {
    if (err) {
      res.send(err)
    } else {
      res.status(200).send(profiles)
    }
  })
  // const findUser = await SignUpModel.findOne({_id:req.user._id})

  // const imageLink = await PromoterProfileImages.findById(findUser.job_images)

  // const userProfile = Object.assign( IDmodel,{profileImages:getImages})

  // const news = Object.assign(userProfile,{"FrontImage":imageLink.promoterImages})

}))

UserProfileRouter.put(
  "/editUserProfile",
  expressAsyncHandler(async (req, res, next) => {
    await ProfileModel.updateOne({ _id: req.body.userid }, req.body.data, option)
      .then(data => {
        res.send(data)
      })
      .catch((err) => {
        res.send(err)
      })


  })
);

UserProfileRouter.delete("/deleteUserAccount", expressAsyncHandler(async (req, res) => {
  console.log(">>", req.body)
  const userSigninDetails = await SignUpModel.findOne({ phoneNumber: req.body.phoneNumber })
  // const userProfile = await ProfileModel.findById(req.body.userid)
  if (!userSigninDetails) {
    res.status(400).send({ "message": 'User not found' });
  } else {
    await userSigninDetails.remove()
    // if (userProfile) {
    //   await userProfile.remove()
    // }
    res.status(400).send({ "message": "User Deleted" })
  }

}))

UserProfileRouter.delete("/deleteuser", isAdminAuth, expressAsyncHandler(async (req, res) => {
  console.log(">>", req.body)
  const job = await ProfileModel.findById(req.body.userid)
  if (!job) {
    res.status(400).send({ "message": 'User not found' });
  } else {
    await job.remove()
    res.status(400).send({ "message": "User Deleted" })
  }

}))

export default UserProfileRouter;
