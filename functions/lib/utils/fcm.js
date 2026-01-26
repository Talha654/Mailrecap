"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendHabitNotification = exports.sendDueDateNotification = exports.sendNotification = exports.messaging = void 0;
const admin = require("firebase-admin");
// Initialize FCM messaging
exports.messaging = admin.messaging();
/**
 * Send a notification to a specific user's FCM token
 */
async function sendNotification(token, payload) {
    try {
        const message = {
            token: token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
            android: {
                priority: 'high',
                notification: {
                    channelId: 'mailrecap_reminders',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };
        const response = await exports.messaging.send(message);
        console.log('[FCM] Successfully sent message:', response);
        return response;
    }
    catch (error) {
        console.error('[FCM] Error sending message:', error);
        return null;
    }
}
exports.sendNotification = sendNotification;
/**
 * Send Due Date Reminder
 */
async function sendDueDateNotification(token) {
    return sendNotification(token, {
        title: 'Upcoming due date',
        body: 'You have an item due in 3 days. Review when convenient.',
        data: {
            type: 'due_date_reminder',
        },
    });
}
exports.sendDueDateNotification = sendDueDateNotification;
/**
 * Send Habit-Based Scan Reminder
 */
async function sendHabitNotification(token) {
    return sendNotification(token, {
        title: 'Scan reminder',
        body: "It's usually a good time to scan. Only if you need to.",
        data: {
            type: 'habit_reminder',
        },
    });
}
exports.sendHabitNotification = sendHabitNotification;
//# sourceMappingURL=fcm.js.map