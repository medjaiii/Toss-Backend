// sendNotification.js
import admin from 'firebase-admin';
import fs from 'fs';

// Read Firebase service account JSON
const serviceAccount = JSON.parse(
    fs.readFileSync(new URL('./firebase-service-account.json', import.meta.url))
);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
