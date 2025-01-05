import { Server } from "socket.io";
import SignUpModel from "../model/SignUpModel.js";
import Chat from "../model/chat.js";
import Location from "../model/location.js";
import GroupChat from "../model/group_chat_schema.js";
// import sendNotification from "./sendNotification";

const websocketSetup = (server) => {
    const io = new Server(server);
    //   io.listen(server)
    // Chat and Live Location Handlers
    io.on("connection", (socket) => {
        console.log("User connected");

        // Handle user joining (store socket ID)
        socket.on("join", (userId) => {
            SignUpModel.findByIdAndUpdate(userId, { socketId: socket.id }).exec();
            console.log(socket.id);
        });


        // Handle user joining a group
        socket.on("joinGroup", async (data) => {
            const { groupId, userId } = data;

            // Verify that the user is part of the group
            const groupChat = await GroupChat.findById(groupId);

            if (groupChat && groupChat.members.includes(userId)) {
                // Join the user to the group room
                socket.join(groupId);
                console.log(`User ${userId} joined group ${groupId}`);
            } else {
                console.log(`User ${userId} is not a member of group ${groupId}`);
                socket.emit("error", { message: "You are not a member of this group" });
            }
        });

        // Handle user joining a group
        socket.on("leaveGroup", async (data) => {
            const { groupId, userId } = data;

            // Verify that the user is part of the group
            const groupChat = await GroupChat.findById(groupId);

            if (groupChat && groupChat.members.includes(userId)) {
                // Join the user to the group room
                socket.leave(groupId);
                console.log(`User ${userId} left group ${groupId}`);
            } else {
                console.log(`User ${userId} is not a member of group ${groupId}`);
                socket.emit("error", { message: "You are not a member of this group" });
            }
        });

        // Handle sending group messages
        socket.on("sendGroupMessage", async (data) => {
            const { groupId, senderId, message } = data;

            // Verify the group exists and sender is a member
            const groupChat = await GroupChat.findById(groupId);

            if (groupChat && groupChat.members.includes(senderId)) {
                // Add the message to the group chat's messages array
                groupChat.messages.push({ senderId, message });
                await groupChat.save();

                // Notify all members in the group (excluding the sender)
                io.to(groupId).emit("receiveGroupMessage", {
                    groupId,
                    senderId,
                    message,
                    timestamp: new Date().toISOString(),
                });
                console.log(`Message sent to group ${groupId} by user ${senderId}`);
            } else {
                console.log(`Failed to send message: User ${senderId} not in group ${groupId}`);
                socket.emit("error", { message: "You are not authorized to send messages to this group" });
            }
        });

        // Handle sending chat messages
        socket.on("sendMessage", async (data) => {
            const { senderId, receiverId, message } = data;

            // Find or create a chat document between the two users
            let chat = await Chat.findOne({
                $or: [
                    { user1: senderId, user2: receiverId },
                    { user1: receiverId, user2: senderId },
                ],
            });

            if (!chat) {
                // Create a new chat if it doesn't exist
                chat = new Chat({ user1: senderId, user2: receiverId, messages: [] });
                await chat.save();

                // Update both users with the reference to this chat
                await SignUpModel.findByIdAndUpdate(senderId, { chat: chat._id });
                await SignUpModel.findByIdAndUpdate(receiverId, { chat: chat._id });
            }

            // Add the new message to the chat document
            chat.messages.push({ senderId, message });
            await chat.save();

            // Notify the receiver if they're online
            const receiver = await SignUpModel.findById(receiverId);
            if (receiver && receiver.socketId) {
                io.to(receiver.socketId).emit("receiveMessage", {
                    senderId,
                    message,
                    chatId: chat._id,
                });
            }
        });

        // Handle updating the user's location
        socket.on("sendLocation", async (data) => {
            const { userId, latitude, longitude } = data;

            // Find the user's existing location
            let user = await SignUpModel.findById(userId).populate("location");

            if (user && user.location) {
                // Update the existing location document
                await Location.findByIdAndUpdate(user.location._id, {
                    latitude: latitude,
                    longitude: longitude,
                    timestamp: Date.now(), // Update timestamp as well
                });
            } else {
                // Create a new location document if not present
                const newLocation = new Location({ userId, latitude, longitude });
                await newLocation.save();

                // Update the user model to reference the new location document
                await SignUpModel.findByIdAndUpdate(userId, {
                    location: newLocation._id,
                });
            }

            // Emit location update to the user (optional, for real-time feedback)
            if (user && user.socketId) {
                io.to(user.socketId).emit("locationUpdate", {
                    latitude,
                    longitude,
                    userId,
                });
            }
        });

        // Handle user disconnecting
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

export default websocketSetup;

// import { Server } from "socket.io";
// import SignUpModel from "../model/SignUpModel.js";
// import Chat from "../model/chat.js";
// import Location from "../model/location.js";

// const websocketSetup = (server) => {
//     const io = new Server(server);
//     //   io.listen(server)
//     // Chat and Live Location Handlers
//     io.on("connection", (socket) => {
//         console.log("User connected");

//         // Handle user joining (store socket ID)
//         // socket.on("join", (userId) => {
//         //   SignUpModel.findByIdAndUpdate(userId, { socketId: socket.id }).exec();
//         //   console.log(socket.id);
//         // });

//         // Handle sending chat messages
//         socket.on("message", async (data) => {
//             let parsedData = data;
//             console.log("message", data);
//             if (typeof data === "string") {
//                 parsedData = JSON.parse(data);
//             }

//             // { type: 'login', userId: 'dummyuserId' }
//             if (parsedData.type === "login") {
//                 SignUpModel.findByIdAndUpdate(parsedData.userId, {
//                     socketId: socket.id,
//                 }).exec();
//                 // user has logged onto chat here but is still not in a room
//                 //todo create a new model in mongo to store chat rooms

//                 // return;
//             }
//             // this is if you want to use rooms { type: 'join' , chatRoomId: 'testRoom'}
//             if (parsedData.type === "join") {
//                 console.log("join room request", parsedData);
//                 // send this message every time the user changes chat on client
//                 const { chatRoomId } = parsedData;
//                 console.log("old rooms", socket.rooms);
//                 // at this point you should have chat room Id so user can join channel(socket.io)
//                 if (socket.rooms.length > 0) {
//                     socket.rooms.map(async (room) => {
//                         await socket.leave(room); // to leave all existing rooms
//                     });
//                 }

//                 socket.join(chatRoomId); // this way user join a seperate channel private to them else youll be sending everyones messages to evryone
//                 console.log("new rooms", socket.rooms);
//             }

//             console.log("the parsed data is: ", parsedData);

//             if (
//                 parsedData.type === "message" &&
//                 parsedData?.senderId &&
//                 parsedData?.groupId &&
//                 parsedData?.message
//             ) {
//                 const { senderId, message, groupId } = parsedData;

//                 // // Find or create a chat document between the two users
//                 // let chat = await Chat.findOne({
//                 //     $or: [
//                 //         { user1: senderId, user2: receiverId },
//                 //         { user1: receiverId, user2: senderId },
//                 //     ],
//                 // });

//                 // if (!chat) {
//                 //     // Create a new chat if it doesn't exist
//                 //     chat = new Chat({ user1: senderId, user2: receiverId, messages: [] });
//                 //     await chat.save();

//                 //     // Update both users with the reference to this chat
//                 //     await SignUpModel.findByIdAndUpdate(senderId, { chat: chat._id });
//                 //     await SignUpModel.findByIdAndUpdate(receiverId, { chat: chat._id });
//                 // }

//                 // // Add the new message to the chat document
//                 // chat.messages.push({ senderId, message });
//                 // await chat.save();

//                 // // Notify the receiver if they're online
//                 // const receiver = await SignUpModel.findById(receiverId);
//                 // if (receiver && receiver.socketId) {
//                 //     io.to(receiver.socketId).emit("receiveMessage", {
//                 //         senderId,
//                 //         message,
//                 //         chatId: chat._id, // roomId
//                 //     });
//                 // }
//                 const groupChat = await GroupChat.findById(groupId);

//                 if (groupChat && groupChat.members.includes(senderId)) {
//                     // Add the message to the group chat's messages array
//                     groupChat.messages.push({ senderId, message });

//                     await groupChat.save();

//                     // Notify all members in the group (excluding the sender)
//                     io.to(groupId).emit("receiveMessage", {
//                         groupId,
//                         senderId,
//                         message,
//                         timestamp: Date.now(),
//                     });
//                     console.log(`Message sent to group ${groupId} by user ${senderId}`);
//                 } else {
//                     console.log(`Failed to send message: User ${senderId} not in group ${groupId}`);
//                     socket.emit("error", { message: "You are not authorized to send messages to this group" });
//                 }
//             }
//             // { type: 'location', userId: 'kuch bhi', latitude: '', longitude: ''}
//             if (parsedData.type === "location") {
//                 const { userId, latitude, longitude } = parsedData;

//                 // Find the user's existing location
//                 let user = await SignUpModel.findById(userId).populate("location");

//                 if (user && user.location) {
//                     // Update the existing location document
//                     await Location.findByIdAndUpdate(user.location._id, {
//                         latitude: latitude,
//                         longitude: longitude,
//                         timestamp: Date.now(), // Update timestamp as well
//                     });
//                 } else {
//                     // Create a new location document if not present
//                     const newLocation = new Location({ userId, latitude, longitude });
//                     await newLocation.save();

//                     // Update the user model to reference the new location document
//                     await SignUpModel.findByIdAndUpdate(userId, {
//                         location: newLocation._id,
//                     });
//                 }

//                 // Emit location update to the user (optional, for real-time feedback)
//                 if (user && user.socketId) {
//                     io.to(user.socketId).emit("locationUpdate", {
//                         latitude,
//                         longitude,
//                         userId,
//                     });
//                 }
//             }
//         });

//         // Handle updating the user's location
//         // socket.on("sendLocation", async (data) => {
//         //   const { userId, latitude, longitude } = data;

//         //   // Find the user's existing location
//         //   let user = await SignUpModel.findById(userId).populate("location");

//         //   if (user && user.location) {
//         //     // Update the existing location document
//         //     await Location.findByIdAndUpdate(user.location._id, {
//         //       latitude: latitude,
//         //       longitude: longitude,
//         //       timestamp: Date.now(), // Update timestamp as well
//         //     });
//         //   } else {
//         //     // Create a new location document if not present
//         //     const newLocation = new Location({ userId, latitude, longitude });
//         //     await newLocation.save();

//         //     // Update the user model to reference the new location document
//         //     await SignUpModel.findByIdAndUpdate(userId, {
//         //       location: newLocation._id,
//         //     });
//         //   }

//         //   // Emit location update to the user (optional, for real-time feedback)
//         //   if (user && user.socketId) {
//         //     io.to(user.socketId).emit("locationUpdate", {
//         //       latitude,
//         //       longitude,
//         //       userId,
//         //     });
//         //   }
//         // });

//         // Handle user disconnecting
//         socket.on("disconnect", () => {
//             console.log("User disconnected");
//         });
//     });

//     // io.on("connection", (client) => {
//     //   console.log("connection", client)
//     //   // client.on("event", (data) => {
//     //   //   console.log("data from socket ", data);
//     //   // });
//     //   client.on("message", (data) => {
//     //     console.log("message from socket ", data);
//     //   });
//     //   client.on("disconnect", (err) => {
//     //     console.log("disconnect", err);
//     //   });
//     // });
// };

// export default websocketSetup;