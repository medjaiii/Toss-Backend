import bcrypt from "bcryptjs";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../../util.js";
import SignUpModel from "../model/SignUpModel.js";

const SignUpRouter = express.Router();

SignUpRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const User = new SignUpModel({
        name: req.body.name,
        email: req.body.email,
        phoneNumber:  req.body.phoneNumber,
        currentLocation: req.body.currentLocation,
        password: bcrypt.hashSync(req.body.password, 8),
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
      res.status(200).send({
        _id:findUser._id,
        token:generateToken(findUser)
      })
      return
    }
  }
  res.status(404).send({message:"Invalid Email or password"})

})
)


export default SignUpRouter