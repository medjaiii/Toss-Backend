import bcrypt from "bcryptjs";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import uploadFile, { handleIntroVideoUpload } from "../../../../Multer_config.js";
import { generateToken, isAuth } from "../../util.js";
import PromoterProfileImages from "../model/PromoterImagesModel.js";
import PromoterProfileVideo from "../model/PromoterVideosModel.js";
import SignUpModel from "../model/SignUpModel.js";
import { createRequire } from "module";
import dotenv from "dotenv"
import ProfileModel from "../../profile/model/UserProfile.js";
import UserProfileImages from "../../profile/model/UserImages.js";
import { option } from "../../../../DataBaseConstants.js";
import Chat from '../model/chat.js';
import GroupChat from '../model/group_chat_schema.js';
import Mongoose from "mongoose";
import PromoterSignUpModel from "../model/PromoterSignUpModel.js";
import sendNotification from '../../notification-service/send_notification.js';

dotenv.config()


const require = createRequire(import.meta.url);
var Twilio = require("twilio");
let TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
let TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
let TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
let SERVICE_SID = process.env.SERVICE_SID

const accountSid = TWILIO_ACCOUNT_SID;

const authToken = TWILIO_AUTH_TOKEN;

const client = new Twilio(accountSid, authToken);

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
      phoneNumber: req.body.phoneNumber,
      currentLocation: req.body.currentLocation,
      password: bcrypt.hashSync(req.body.password, 8),
      job_images: getId
    });

    if (req.body.firebaseToken) {
      userObject.firebaseToken = req.body.firebaseToken;
    }

    const userProfileImages = new UserProfileImages({
      userProfileImage: images,
    });

    const getUerId = (await userProfileImages.save())._id;

    const UserProfile = new ProfileModel({
      fullname: req.body.name,
      email: req.body.email,
      area: req.body.currentLocation ? req.body.currentLocation : "",
      contactNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
      city: req.body.currentLocation ? req.body.currentLocation : "",
      about: req.body.about ? req.body.about : "",
      previousExpereince: req.body.previousExpereince ? req.body.previousExpereince : "",
      skills: req.body.skills ? req.body.skills : [],
      height: req.body.height ? req.body.height : "",
    });

    const saveProfile = await UserProfile.save();

    const getUserData = await SignUpModel.exists({ email: req.body.email })
    if (getUserData) {
      const findUser = await SignUpModel.findOne({ _id: getUserData._id })
      const getVerifiedStatus = findUser.isVerified

      if (getVerifiedStatus === "true") {
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser, { job_images: imageLink })
        res.status(200).send({
          updatedUser,
          saveProfile,
          token: generateToken(findUser)
        })
      } else {
        await client.verify
          .services(SERVICE_SID)
          .verifications.create({
            to: `+${91}${req.body.phoneNumber}`,
            channel: "sms",
          });

        await SignUpModel.findOneAndUpdate({ _id: getUserData._id }, {
          "$set": {
            "name": req.body.name, "email": req.body.email, "phoneNumber": req.body.phoneNumber, "currentLocation": req.body.currentLocation, 'password': bcrypt.hashSync(req.body.password, 8), "job_images": getId
          }
        }).exec(function (err, user) {
          console.log(user)
        })
        res.status(200).send({
          "message": `User is not verfied. OTP Code Sent!`
        })
      }
    } else {
      await User.save()
      await client.verify
        .services(SERVICE_SID)
        .verifications.create({
          to: `+${91}${req.body.phoneNumber}`,
          channel: "sms",
        });

      res.status(200).send({
        "message": `User Does Not Exists. OTP Code Sent!`
      })
    }

  })
);

SignUpRouter.post("/signin", expressAsyncHandler(async (req, res) => {

  // we cannot signup using username as UX is not available for username
  const findUser = await SignUpModel.findOne({ email: req.body.email })
  console.log("reached here 1");
  if (findUser) {
    if (bcrypt.compareSync(req.body.password, findUser.password)) {
      console.log(findUser.isVerified === "true")
      if (findUser.isVerified === "true") {
        console.log("reached here 4");
        if (req.body.firebaseToken) {
          console.log("fcm token is: ", req.body.firebaseToken);
          // Update the firebaseToken if it's provided in the request
          findUser.firebaseToken = req.body.firebaseToken;
          await findUser.save(); // Save the updated user with the new firebaseToken
        }
        const imageLink = await PromoterProfileImages.findById(findUser.job_images)
        const updatedUser = Object.assign(findUser, { job_images: imageLink })

        res.status(200).send({
          updatedUser,
          token: generateToken(findUser)
        })

      } else {
        res.status(400).send({
          "message": "User is not Verified. Please Verify"
        })
      }

    } else {
      res.status(400).send({ "message": "Password Do not Match" })
    }
  } else {
    res.status(400).send({ message: "Account not found. Please check your credentials" })
  }

})
)

SignUpRouter.delete("/deleteimage/:id", isAuth, expressAsyncHandler(async (req, res) => {
  const id = req.params.id
  const findUser = await SignUpModel.findOne({ _id: req.user._id })
  await PromoterProfileImages.findOneAndUpdate({ _id: findUser.job_images }, { "$pull": { "promoterImages": { _id: id } } }, { safe: true, multi: false })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      res.status(400).json({ "message": err })
    })
}))

SignUpRouter.put(
  "/editImages", isAuth, uploadFile,
  expressAsyncHandler(async (req, res, next) => {
    const images = req.files.reduce(
      (acc, image) => [...acc, { name: image.location }],
      []
    );

    const findUser = await SignUpModel.findOne({ _id: req.user._id })

    await PromoterProfileImages.findOneAndUpdate({ _id: findUser.job_images }, { "$push": { promoterImages: images } }, option)
      .then((data) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        res.status(400).json({ "message": err })
      })
  })
);

// SignUpRouter.put(
//   "/editIntroVideo", isAuth, uploadFile,
//   expressAsyncHandler(async (req, res, next) => {
//     const introVideo = req.files[0].location;

//     const findUser = await SignUpModel.findOne({ _id: req.user._id });

//     await PromoterProfileVideo.findOneAndUpdate(
//       { _id: findUser.job_images },
//       {
//         $set: { introVideo },
//         $setOnInsert: { introVideo } // Create the field if it doesn't exist
//       },
//       option
//     )
//       .then((data) => {
//         res.status(200).json(data);
//       })
//       .catch((err) => {
//         res.status(400).json({ "message": err });
//       });
//   })
// );

SignUpRouter.put(
  "/editIntroVideo", isAuth, handleIntroVideoUpload,
  expressAsyncHandler(async (req, res, next) => {
    const introVideo = req.files[0].location; // Assuming this is the video URL

    try {
      const findUser = await SignUpModel.findOne({ _id: req.user._id });

      const updatedVideo = await PromoterProfileVideo.findOneAndUpdate(
        { _id: findUser.intro_video }, // Assuming job_images is the reference to the PromoterProfileVideo
        {
          $set: { promoterVideo: introVideo } // Update promoterVideo field
        },
        { new: true, upsert: true } // `new: true` returns the updated doc, `upsert: true` creates if doesn't exist
      );

      res.status(200).json(updatedVideo);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
);


// API to get all chats between two user IDs
SignUpRouter.get('/chat/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 20;  // Default to 20 messages per page
  const skip = (page - 1) * limit;  // Calculate the number of messages to skip

  try {
    const chat = await Chat.findOne({
      $or: [
        { user1: userId1, user2: userId2 },
        { user1: userId2, user2: userId1 }
      ]
    }).populate('messages.senderId', 'name email');  // Populate sender info

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Sort messages by timestamp in descending order (latest first)
    const sortedMessages = chat.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate messages by using the `slice` method
    const paginatedMessages = sortedMessages.slice(skip, skip + limit);

    res.json({
      page,
      limit,
      totalMessages: sortedMessages.length,  // Total number of messages in the chat
      totalPages: Math.ceil(sortedMessages.length / limit),  // Total number of pages
      messages: paginatedMessages,  // Return the paginated messages
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat messages' });
  }
});


/// api to create a group chat
SignUpRouter.post('/group-chat', async (req, res) => {
  const { groupName, groupDescription, memberIds, groupProfilePic, adminId } = req.body;

  if (!groupName || !groupDescription || !memberIds || memberIds.length < 2) {
    return res.status(400).json({ error: 'Group name, description and at least two members are required' });
  }

  try {
    const groupChat = new GroupChat({
      groupName,
      groupDescription,
      groupProfilePic,
      adminId: adminId,
      members: memberIds,
    });

    await groupChat.save();

    var members = [];

    for (const memberId of groupChat.members) {
      console.log("member id: ", memberId);

      // Combine queries into a single promise
      const userPromise = SignUpModel.findOne({ _id: memberId })
        .select('name email')
        .lean() // Convert to plain JavaScript object for better performance
        .orFail() // Throw an error if no document is found
        .catch(async () => {
          return await PromoterSignUpModel.findOne({ _id: memberId })
            .select('full_name as name, work_email as email')
            .lean()
            .orFail();
        });

      try {
        const user = await userPromise;
        members.push(user);
        console.log(user);
      } catch (error) {
        // Handle the case where the user is not found in either model
        console.error(`User with ID ${memberId} not found`);
      }
    }

    res.status(200).json({
      message: 'Group chat created successfully',
      "_id": groupChat.id,
      "groupName": groupChat.groupName,
      "groupDescription": groupChat.groupDescription,
      "groupProfilePic": groupChat.groupProfilePic,
      "adminId": adminId,
      "members": members,
      "updatedAt": groupChat.updatedAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error creating group chat' });
  }
});


///api to fetch all group chats
SignUpRouter.get('/group-chat/:groupId', async (req, res) => {
  // expressAsyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const groupChat = await GroupChat.findById(groupId);


    console.log(groupChat);

    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Sort messages by timestamp
    const sortedMessages = groupChat.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const paginatedMessages = sortedMessages.slice(skip, skip + limit);

    console.log(sortedMessages);

    res.json({
      page,
      limit,
      totalMessages: sortedMessages.length,
      totalPages: Math.ceil(sortedMessages.length / limit),
      messages: paginatedMessages,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching group chat messages' });
  }
  // });
});


/// api to add new member to the group
SignUpRouter.post('/group-chat/addMember', async (req, res) => {
  const { groupId, userIds } = req.body;  // Expecting an array of user IDs

  try {
    // Find the group by ID
    const group = await GroupChat.findById(groupId).populate('members', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Filter out already existing members from the provided list
    const newUserIds = userIds.filter(userId =>
      !group.members.some(member => member._id.toString() === userId)
    );

    if (newUserIds.length === 0) {
      return res.status(400).json({ message: 'All users are already members of the group' });
    }

    // Add the new users to the group
    group.members.push(...newUserIds);
    await group.save();

    // Populate the newly updated members list for response
    const updatedGroup = await GroupChat.findById(groupId).populate('members', 'name email');

    res.status(200).json({
      message: 'Users added to the group successfully',
      groupId: group._id,
      members: updatedGroup.members, // Send the updated list of members
    });
  } catch (err) {
    console.error('Error adding members to group:', err);
    res.status(500).json({ error: 'An error occurred while adding the members to the group' });
  }
});


/// get all the groups of particular user
SignUpRouter.get('/groups/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {

    let groupsResult = [];
    // Find all groups where the user is a member
    let groups = await GroupChat.find({ members: userId })
      .select('groupName groupDescription members groupProfilePic adminId'); // Select only necessary fields


    if (!groups || groups.length === 0) {
      return res.status(200).json({ message: 'No groups found for this user', groups: [] });
    }

    console.log(groups);


    for (let i = 0; i < groups.length; i++) {
      var group = groups[i];
      var members = [];
      for (const memberId of group.members) {
        console.log("member id: ", memberId);

        // Combine queries into a single promise
        const userPromise = SignUpModel.findOne({ _id: memberId })
          .select('name email')
          .lean() // Convert to plain JavaScript object for better performance
          .orFail() // Throw an error if no document is found
          .catch(async () => {
            return await PromoterSignUpModel.findOne({ _id: memberId })
              .select('full_name as name, work_email as email')
              .lean()
              .orFail();
          });

        try {
          const user = await userPromise;
          members.push(user);
          console.log(user);
        } catch (error) {
          // Handle the case where the user is not found in either model
          console.error(`User with ID ${memberId} not found`);
        }
      }
      groupsResult.push({
        "_id": group.id,
        "groupName": group.groupName,
        "groupDescription": group.groupDescription,
        "groupProfilePic": group.groupProfilePic,
        "adminId": group.adminId,
        "members": members,
        "updatedAt": group.updatedAt,
      })
    }

    // group.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.status(200).json({
      message: 'Groups retrieved successfully',
      totalGroups: groups.length,
      groups: groupsResult,
    });
  } catch (err) {
    console.error('Error fetching user groups:', err);
    res.status(400).json({ error: 'An error occurred while fetching groups' });
  }
});



export default SignUpRouter