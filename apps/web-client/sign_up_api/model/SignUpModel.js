import Mongoose from "mongoose";

const signupSchema = new Mongoose.Schema(
  {
    name: { type: String, required: [true, "name required"] },
    email: {
      type: String,
      required: [true, "email required"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "phone number required"],
    },
    currentLocation: {
      type: String,
      required: [false, "current location required"],
    },
    password: { type: String, required: [true, "password requred"] },
    job_images: { type: Mongoose.Schema.Types.ObjectId, ref: "PromoterProfileImages" },
    intro_video: { type: Mongoose.Schema.Types.ObjectId, ref: "PromoterProfileVideo" },
    location: { type: Mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Reference to the latest location document
    chat: { type: Mongoose.Schema.Types.ObjectId, ref: 'Chat' }, // Reference to a single chat document
    createdDate: {
      type: Date,
      default: Date.now
    },
    isVerified: { type: String, default: false },
    firebaseToken: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

Mongoose.pluralize(null)
signupSchema.index({ email: 1 }, { unique: true })
signupSchema.index({ phoneNumber: 1 }, { unique: true })

const SignUpModel = Mongoose.model("SignUp", signupSchema);

export default SignUpModel;
