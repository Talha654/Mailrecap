import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
    const serviceAccount = require('../../service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'mailrecap-e10e2'
    });
}

const { sendNotification } = require('../utils/fcm');

async function testNotification() {
    console.log('=================================================');
    console.log('🔔 TESTING NOTIFICATION SENDING');
    console.log('=================================================');

    const db = admin.firestore();

    try {
        // Use specific user ID
        const targetUserId = 'UP6dgbmAwnZsC26MYBNxbHmKtRo2';
        console.log('1. Getting user with ID:', targetUserId);

        const userDoc = await db.collection('users').doc(targetUserId).get();

        if (!userDoc.exists) {
            console.error('❌ User not found:', targetUserId);
            return;
        }

        const userData = userDoc.data();
        const userId = userDoc.id;
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) {
            console.error('❌ User found but no FCM token available');
            return;
        }

        console.log(`✅ Found user: ${userId}`);
        console.log(`✅ FCM Token: ${fcmToken.substring(0, 20)}...`);

        // Send test notification
        console.log('\n2. Sending test notification...');
        const result = await sendNotification(fcmToken, {
            title: 'Test Notification',
            body: 'This is a test notification sent from the backend script',
            data: {
                type: 'test',
                timestamp: Date.now().toString(),
            },
        });

        if (result) {
            console.log('=================================================');
            console.log('✅ SUCCESS! Notification sent successfully');
            console.log('Message ID:', result);
            console.log('=================================================');
            console.log('\n📱 Check your device for the notification!');
        } else {
            console.log('=================================================');
            console.log('❌ FAILED! Could not send notification');
            console.log('=================================================');
        }

    } catch (error: any) {
        console.error('=================================================');
        console.error('❌ ERROR:', error.message);
        console.error('=================================================');

        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.error('\n⚠️  The FCM token is invalid or expired.');
            console.error('Try restarting the app to generate a new token.');
        }
    }
}

console.log('Starting notification test...\n');
testNotification()
    .then(() => {
        console.log('\nTest completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
