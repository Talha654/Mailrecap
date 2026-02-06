"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestMail = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
// admin.initializeApp() is already called in index.ts
exports.seedTestMail = functions.https.onRequest(async (req, res) => {
    try {
        const db = admin.firestore();
        console.log('Starting seed process from HTTP function...');
        // 1. Find a valid user
        const usersSnapshot = await db.collection('users')
            .where('notificationsEnabled', '==', true)
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
            console.error('No suitable user found.');
            res.status(404).send('No suitable user found.');
            return;
        }
        console.log(`Found target user: ${targetUser.id}`);
        // 2. Calculate date 3 days from now
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 3);
        targetDate.setHours(12, 0, 0, 0);
        console.log(`Targeting due date: ${targetDate.toISOString()}`);
        // 3. Create Mail Summary
        const mailData = {
            userId: targetUser.id,
            title: 'Test Due Date Notification via Shell',
            date: firestore_1.Timestamp.now(),
            summary: 'This is a test mail seeded via functions shell.',
            fullText: 'Full text...',
            suggestions: ['Complete the task'],
            actionableDate: {
                date: firestore_1.Timestamp.fromDate(targetDate),
                type: 'deadline',
                confidence: 'HIGH',
                description: 'Due in 3 days'
            },
            priority: true,
            isCompleted: false,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now()
        };
        const docRef = await db.collection('mailSummaries').add(mailData);
        console.log(`Successfully created test mail summary with ID: ${docRef.id}`);
        res.status(200).send(`Seeded mail ${docRef.id} for user ${targetUser.id}`);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).send('Error seeding data');
    }
});
//# sourceMappingURL=seedTest.js.map