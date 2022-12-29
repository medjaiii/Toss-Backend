import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSkills = mongoose.Schema({
  skills:[]
})

mongoose.pluralize(null)

const UserSkillModel = mongoose.model("Skills", UserSkills);

export default UserSkillModel;
