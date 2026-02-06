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
// Use require to avoid hoisting issues with imports that might invoke admin.messaging() immediately
const { executeDueDateCheck } = require('../dueDateReminder');
const { Timestamp } = require('firebase-admin/firestore');
async function runTest() {
    console.log('Starting Manual Test for Due Date Reminder...');
    const db = admin.firestore();
    // Test Data tracking
    let testMailId = null;
    let usedUserId = null;
    try {
        // 1. Find a valid user (Real user validation is better than dummy)
        console.log('Looking for a valid user with FcmToken...');
        const usersSnapshot = await db.collection('users')
            .where('notificationsEnabled', '==', true)
            .limit(5)
            .get();
        let targetUser = null;
        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            if (data.fcmToken) {
                targetUser = Object.assign({ id: doc.id }, data);
                break;
            }
        }
        if (!targetUser) {
            console.warn('No real user found. Creating a dummy user for logic test (send will fail).');
            usedUserId = 'TEST_USER_ID_' + Date.now();
            await db.collection('users').doc(usedUserId).set({
                notificationsEnabled: true,
                fcmToken: 'DUMMY_FCM_TOKEN_FOR_TESTING',
                email: 'test@example.com'
            });
            console.log(`Created dummy user: ${usedUserId}`);
        }
        else {
            usedUserId = targetUser.id;
            console.log(`Using real user: ${usedUserId}`);
        }
        // 2. Create Dummy Mail Summary (Due 3 days from now)
        testMailId = 'TEST_MAIL_' + Date.now();
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 3);
        targetDate.setHours(12, 0, 0, 0); // Noon
        await db.collection('mailSummaries').doc(testMailId).set({
            userId: usedUserId,
            title: 'Test Due Date Notification',
            date: Timestamp.now(),
            summary: 'This is a test mail seeded to verify due date reminders.',
            actionableDate: {
                confidence: 'HIGH',
                date: Timestamp.fromDate(targetDate),
                description: 'Test Due in 3 days'
            },
            createdAt: Timestamp.now(),
        });
        console.log(`Created test mail summary: ${testMailId} (Due: ${targetDate.toISOString()})`);
        // 3. Execute the Check
        console.log('------------------------------------------------');
        console.log('Executing executeDueDateCheck logic...');
        console.log('------------------------------------------------');
        // We capture console.log to verify output if needed, or just let it pipe to stdout
        await executeDueDateCheck(db);
        console.log('------------------------------------------------');
        console.log('Check logic execution completed.');
        // 4. Verify Log Existence
        // If successful, a log entry should exist in 'notificationSentLog'
        const logQuery = await db.collection('notificationSentLog')
            .where('mailSummaryId', '==', testMailId)
            .get();
        if (!logQuery.empty) {
            console.log('SUCCESS: Notification log found! The system attempted to send the notification.');
        }
        else {
            console.log('WARNING: No notification log found. The check might have failed to send (token issue?) or didn\'t pick up the item.');
        }
    }
    catch (error) {
        console.error('Test failed with error:', error);
        if (error.message && error.message.includes('default credentials')) {
            console.error('\nNOTE: Run `gcloud auth application-default login` to authenticate locally.');
        }
    }
    finally {
        // Cleanup
        if (testMailId || (usedUserId && usedUserId.startsWith('TEST_USER_ID_'))) {
            console.log('Cleaning up test data...');
            if (testMailId) {
                await db.collection('mailSummaries').doc(testMailId).delete();
                const logs = await db.collection('notificationSentLog').where('mailSummaryId', '==', testMailId).get();
                logs.docs.forEach(d => d.ref.delete());
            }
            if (usedUserId && usedUserId.startsWith('TEST_USER_ID_')) {
                await db.collection('users').doc(usedUserId).delete();
            }
            console.log('Cleanup complete.');
        }
    }
}
runTest();
//# sourceMappingURL=manualTestTrigger.js.map