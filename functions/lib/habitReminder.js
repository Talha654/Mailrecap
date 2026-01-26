"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHabitReminders = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const fcm_1 = require("./utils/fcm");
const confidence_1 = require("./utils/confidence");
/**
 * Scheduled Function: Check for habit reminders every 30 minutes
 */
exports.checkHabitReminders = functions.pubsub.schedule('every 30 minutes').onRun(async (_context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const todayStr = new Date().toISOString().split('T')[0];
    console.log('[HabitReminder] Starting check...');
    try {
        // Get all users who have notifications enabled
        const usersSnapshot = await db.collection('users')
            .where('notificationsEnabled', '==', true)
            .get();
        let sentCount = 0;
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            if (!userData.fcmToken)
                continue;
            // 1. Check if we already sent a habit reminder today (Max 1 per day rule)
            const logRef = db.collection('habitReminderLog').doc(userId).collection('daily').doc(todayStr);
            const logDoc = await logRef.get();
            if (logDoc.exists) {
                continue;
            }
            // 2. Check if user already scanned something today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const scansToday = await db.collection('userScanHistory').doc(userId).collection('scans')
                .where('scannedAt', '>=', startOfDay)
                .limit(1)
                .get();
            if (!scansToday.empty) {
                continue; // User already active today
            }
            // 3. Analyze history (last 14 days)
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const historySnapshot = await db.collection('userScanHistory').doc(userId).collection('scans')
                .where('scannedAt', '>=', twoWeeksAgo)
                .get();
            if (historySnapshot.empty)
                continue;
            const scanTimes = historySnapshot.docs.map(doc => {
                const data = doc.data();
                return { hour: data.localTimeHour, minute: data.localTimeMinute };
            });
            // 4. Calculate usual time with confidence
            const result = (0, confidence_1.calculateUsualScanTime)(scanTimes);
            if (result.confidence !== 'HIGH')
                continue;
            // 5. Check if now is ~30 mins before usual time
            const timezone = userData.timezone || 'UTC';
            if ((0, confidence_1.isThirtyMinutesBefore)(result.time, timezone)) {
                // Send Notification
                const response = await (0, fcm_1.sendHabitNotification)(userData.fcmToken);
                if (response) {
                    sentCount++;
                    await logRef.set({
                        sentAt: now,
                        targetTime: result.time,
                        timezone: timezone
                    });
                    console.log(`[HabitReminder] Sent reminder to user ${userId}`);
                }
            }
        }
        console.log(`[HabitReminder] Completed. Sent ${sentCount} reminders.`);
    }
    catch (error) {
        console.error('[HabitReminder] Error:', error);
    }
});
//# sourceMappingURL=habitReminder.js.map