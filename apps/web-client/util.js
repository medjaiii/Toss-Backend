import Jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return Jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET || "SomethingSecret",
    {
      expiresIn: "720m",
    }
  );
};
