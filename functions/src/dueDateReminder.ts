import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendDueDateNotification } from './utils/fcm';
import { isExactlyDaysAway } from './utils/confidence';

/**
 * Scheduled Function: Check for due date reminders daily at 8:00 AM
 */
export const checkDueDateReminders = functions.pubsub.schedule('0 8 * * *').onRun(async (_context: functions.EventContext) => {
    const db = admin.firestore();
    await executeDueDateCheck(db);
});

/**
 * Execute the logic for checking due date reminders.
 * Extracted for manual testing purposes.
 */
export async function executeDueDateCheck(db: admin.firestore.Firestore) {
    const now = Timestamp.now();

    console.log('[DueDateReminder] Starting daily check...');

    try {
        // Query mail summaries with HIGH confidence actionable dates
        // Note: Using composite index on actionableDate.confidence + actionableDate.date
        const mailQuery = db.collection('mailSummaries')
            .where('actionableDate.confidence', '==', 'HIGH');

        const snapshot = await mailQuery.get();
        let sentCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const dateTimestamp = data.actionableDate?.date;

            if (!dateTimestamp) continue;

            // Check if date is exactly 3 days away
            const targetDate = dateTimestamp.toDate();
            if (!isExactlyDaysAway(targetDate, 3)) continue;

            console.log(`[DueDateReminder] Found potential reminder for mail ${doc.id}`);

            // Check for existing notification log to prevent duplicates
            const logQuery = await db.collection('notificationSentLog')
                .where('mailSummaryId', '==', doc.id)
                .where('type', '==', 'due_date_reminder')
                .limit(1)
                .get();

            if (!logQuery.empty) {
                console.log(`[DueDateReminder] Already sent for ${doc.id}, skipping.`);
                continue;
            }

            // Get user to check notifications enabled and getting fcm token
            const userDoc = await db.collection('users').doc(data.userId).get();
            const userData = userDoc.data();

            if (!userData || !userData.fcmToken || userData.notificationsEnabled === false) {
                console.log(`[DueDateReminder] User ${data.userId} not eligible for notification.`);
                continue;
            }

            // Send Notification
            const response = await sendDueDateNotification(userData.fcmToken);

            if (response) {
                sentCount++;
                // Log the sent notification
                await db.collection('notificationSentLog').add({
                    mailSummaryId: doc.id,
                    userId: data.userId,
                    type: 'due_date_reminder',
                    sentAt: now,
                    targetDate: dateTimestamp
                });
                console.log(`[DueDateReminder] Sent notification for ${doc.id}`);
            }
        }

        console.log(`[DueDateReminder] Completed. Sent ${sentCount} reminders.`);
    } catch (error) {
        console.error('[DueDateReminder] Error:', error);
    }
}
