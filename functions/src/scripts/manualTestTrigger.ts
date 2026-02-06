import * as admin from 'firebase-admin';

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
        // Use specific user with valid FCM token
        console.log('Using user with provided FCM token...');
        usedUserId = 'UP6dgbmAwnZsC26MYBNxbHmKtRo2';
        const targetFcmToken = 'foqvi3wrRH6ztspR_I5av5:APA91bGCixPEeYlZrJ19WK6HdXPJejnnlrvNV1_dsaYkzbyEHdOMRDsXtybZ-p029I2QFY-2JgLrpppDiKbEIOVnKNrD8-rWqE1DrIV67QVSnnzbpErEK20';

        // Update user's FCM token in Firestore to ensure it's current
        await db.collection('users').doc(usedUserId).set({
            fcmToken: targetFcmToken,
            notificationsEnabled: true,
        }, { merge: true });

        console.log(`Using real user: ${usedUserId}`);

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
                date: Timestamp.fromDate(targetDate), // Must match the "exactly 3 days" check
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
        } else {
            console.log('WARNING: No notification log found. The check might have failed to send (token issue?) or didn\'t pick up the item.');
        }

    } catch (error: any) {
        console.error('Test failed with error:', error);
        if (error.message && error.message.includes('default credentials')) {
            console.error('\nNOTE: Run `gcloud auth application-default login` to authenticate locally.');
        }
    } finally {
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
