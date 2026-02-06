
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Admin with default credentials
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in environment or use default if running in firebase shell
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: 'mailrecap-e10e2'
    });
}

const db = admin.firestore();

async function seedTestMail() {
    try {
        console.log('Starting seed process...');

        // 1. Find a valid user
        const usersSnapshot = await db.collection('users')
            .where('notificationsEnabled', '==', true)
            .get();

        let targetUser = null;
        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            if (data.fcmToken) {
                targetUser = { id: doc.id, ...data };
                break;
            }
        }

        if (!targetUser) {
            console.error('No suitable user found with notifications enabled and FCM token.');
            process.exit(1);
        }

        console.log(`Found target user: ${targetUser.id}`);

        // 2. Calculate date 3 days from now
        // The checkDueDateReminders runs daily.
        // It checks if (targetDate - today) in days == 3.
        // isExactlyDaysAway logic:
        /*
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === days;
        */

        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 3);
        // Set it to a generic time, e.g., noon, to be safe, though the logic normalizes to start of day.
        targetDate.setHours(12, 0, 0, 0);

        console.log(`Targeting due date: ${targetDate.toISOString()}`);

        // 3. Create Mail Summary
        const mailData = {
            userId: targetUser.id,
            title: 'Test Due Date Notification',
            date: Timestamp.now(), // Received date
            summary: 'This is a test mail seeded to verify due date reminders.',
            fullText: 'Full text of the test mail...',
            suggestions: ['Complete the task'],
            actionableDate: {
                date: Timestamp.fromDate(targetDate),
                type: 'deadline',
                confidence: 'HIGH',
                description: 'Due in 3 days'
            },
            priority: true,
            isCompleted: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await db.collection('mailSummaries').add(mailData);
        console.log(`Successfully created test mail summary with ID: ${docRef.id}`);
        console.log(`Run 'npm run shell' and call 'checkDueDateReminders()' to test immediately, or wait for schedule.`);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedTestMail();
