"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDueDateReminders = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const fcm_1 = require("./utils/fcm");
const confidence_1 = require("./utils/confidence");
/**
 * Scheduled Function: Check for due date reminders daily at 8:00 AM
 */
exports.checkDueDateReminders = functions.pubsub.schedule('0 8 * * *').onRun(async (_context) => {
    var _a;
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
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
            const dateTimestamp = (_a = data.actionableDate) === null || _a === void 0 ? void 0 : _a.date;
            if (!dateTimestamp)
                continue;
            // Check if date is exactly 3 days away
            const targetDate = dateTimestamp.toDate();
            if (!(0, confidence_1.isExactlyDaysAway)(targetDate, 3))
                continue;
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
            const response = await (0, fcm_1.sendDueDateNotification)(userData.fcmToken);
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
    }
    catch (error) {
        console.error('[DueDateReminder] Error:', error);
    }
});
//# sourceMappingURL=dueDateReminder.js.map