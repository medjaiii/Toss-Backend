// sendNotification.js
import admin from 'firebase-admin';
import fs from 'fs';

import { config } from "dotenv";
config();

import { cert, initializeApp } from "firebase-admin/app";

initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)),
});

// Function to send notifications
async function sendNotification({ title, body, tokens, data }) {
    try {
        // Prepare the message for each token
        const messages = {
            notification: {
                title: title,
                body: body,
            },
            data: data || {},
            tokens: tokens,  // Using token individually
        };

        // Send the messages using sendAll
        const response = await admin.messaging().sendEachForMulticast(messages);
        console.log('Notifications sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

// Export the sendNotification function
export default sendNotification;
