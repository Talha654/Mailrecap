"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
    const serviceAccount = require('../../service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'mailrecap-e10e2'
    });
}
const fcm_1 = require("../utils/fcm");
async function sendManualTestNotification() {
    const fcmToken = 'dtVLO1sDS86h_4CWi8yKJJ:APA91bFRR6aEmfMKcNM6JQBWyOiWzf3E1WpVY1sQemOxSPKa1k7aueh7MAkNbwskGj29pMdGIp292IHtkCNNI-e47qRHyGHp3bC3uTPVN0hR4ipu4XZ6V84';
    console.log('Sending manual test notification...');
    console.log('FCM Token:', fcmToken.substring(0, 20) + '...');
    try {
        const result = await (0, fcm_1.sendNotification)(fcmToken, {
            title: '🧪 Test Notification',
            body: 'This is a manual test notification from MailRecap!',
            data: {
                type: 'manual_test',
                timestamp: new Date().toISOString(),
            },
        });
        if (result) {
            console.log('✅ Notification sent successfully!');
            console.log('Message ID:', result);
        }
        else {
            console.log('❌ Failed to send notification');
        }
    }
    catch (error) {
        console.error('❌ Error sending notification:', error);
    }
    process.exit(0);
}
sendManualTestNotification();
//# sourceMappingURL=sendManualNotification.js.map