import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import SignUpRouter from "./apps/web-client/sign_up_api/router/SignupRouter.js"
import UserProfileRouter from "./apps/web-client/profile/router/ProfileRouter.js"
import PromoterSignup from "./apps/web-client/sign_up_api/router/PromoterSignUpRouter.js"
import Jobrouter from "./apps/web-client/job/router/JobRouter.js"
import Progressrouter from "./apps/web-client/progress/router/ProgressRouter.js"
import SmsRouter from "./apps/web-client/sms/TwiliioApi.js"
import EmailRouter from "./apps/web-client/email/EmailRouter.js"
import AdminSignup from "./apps/web-client/sign_up_api/router/AdminSignup.js"
import cors from "cors"
import websocketSetup from "./apps/web-client/sign_up_api/router/chat_location_socket.js"
import { createServer } from 'node:http';
dotenv.config()

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/naukridb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})

app.use("/api/users", SignUpRouter)
app.use("/api/userProfile", UserProfileRouter)
app.use("/api/promoter", PromoterSignup)
app.use("/api/job", Jobrouter)
app.use("/api/status", Progressrouter)
app.use("/api/sms", SmsRouter)
app.use("/api/email", EmailRouter)
app.use("/api/admin", AdminSignup)

app.use((err, req, res, next) => {
    console.log(err)
    res.status(400).send({ message: err.message, field: err.field })
    next()
})
websocketSetup(server)
//all port configuration
const port = process.env.PORT || 5001
server.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`)
})




// // server.js
// import express from 'express';
// import sendNotification from './apps/web-client/notification-service/send_notification.js'; // Import the sendNotification function

// const app = express();
// const PORT = 5001;

// // Middleware to parse JSON
// app.use(express.json());

// // API to send a test notification
// app.post('/send-test-notification', async (req, res) => {
//     const { title, body, tokens, data } = req.body;

//     // Validate input
//     if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
//         return res.status(400).json({ error: 'Tokens array is required and cannot be empty.' });
//     }

//     if (!title || !body) {
//         return res.status(400).json({ error: 'Title and body are required.' });
//     }

//     try {
//         const response = await sendNotification({ title, body, tokens, data });
//         res.status(200).json({ message: 'Notification sent successfully!', response });
//     } catch (error) {
//         console.error('Error sending notification:', error);
//         res.status(500).json({ error: 'Failed to send notification.' });
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
