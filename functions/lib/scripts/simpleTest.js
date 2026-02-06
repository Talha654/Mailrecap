"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const dns = require("dns");
// Force IPV4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const serviceAccount = require('../../service-account.json');
// Need to init app to use credential for token generation? 
// Actually admin.credential.cert returns a Credential object that has getAccessToken.
const credential = admin.credential.cert(serviceAccount);
admin.initializeApp({
    credential: credential,
    projectId: 'mailrecap-e10e2'
});
async function run() {
    console.log('Starting Simple FCM Test (REST API mode)...');
    // Get a user
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
        .where('notificationsEnabled', '==', true)
        .limit(1)
        .get();
    if (usersSnapshot.empty) {
        console.log('No users found');
        return;
    }
    const user = usersSnapshot.docs[0].data();
    const token = user.fcmToken;
    console.log(`Found user ${usersSnapshot.docs[0].id} with token: ${token ? 'YES' : 'NO'}`);
    if (!token) {
        console.log('Token missing');
        return;
    }
    console.log('Getting access token...');
    const accessTokenObj = await credential.getAccessToken();
    const accessToken = accessTokenObj.access_token;
    console.log('Got access token.');
    const payload = {
        message: {
            token: token,
            notification: {
                title: 'Simple Test REST',
                body: 'This is a simple test using REST API.',
            }
        }
    };
    console.log('Sending message via REST...');
    try {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/mailrecap-e10e2/messages:send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const text = await response.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response body: ${text}`);
    }
    catch (error) {
        console.error('Error sending message:', error);
    }
}
run();
//# sourceMappingURL=simpleTest.js.map