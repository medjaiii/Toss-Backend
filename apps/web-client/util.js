import Jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return Jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber:user.phoneNumber,
      isPromoter:user.promoter
    },
    process.env.JWT_SECRET || "SomethingSecret",
    {
      expiresIn: "720m",
    }
  );
};

export const isAuth = (req,res,next)=>{

  const authorization = req.headers.authorization
  if(authorization){
    const token = authorization.slice(7,authorization.length)
    Jwt.verify(token,process.env.JWT_SECRET || "SomethingSecret",(err,decode)=>{
      if(err){
        res.status(400).send({message:"Invalid Token"})
      }else{
        req.user = decode
        next()
      }
    }) 
  }else{
    res.status(400).send({message:"No Token"})
  }

}