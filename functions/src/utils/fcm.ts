import * as admin from 'firebase-admin';

// Initialize FCM messaging
export const messaging = admin.messaging();

export interface NotificationPayload {
    title: string;
    body: string;
    data?: { [key: string]: string };
}

/**
 * Send a notification to a specific user's FCM token
 */
export async function sendNotification(token: string, payload: NotificationPayload): Promise<string | null> {
    try {
        const message: admin.messaging.Message = {
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

        const response = await messaging.send(message);
        console.log('[FCM] Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('[FCM] Error sending message:', error);
        return null;
    }
}

/**
 * Send Due Date Reminder
 */
export async function sendDueDateNotification(token: string): Promise<string | null> {
    return sendNotification(token, {
        title: 'Upcoming due date',
        body: 'You have an item due in 3 days. Review when convenient.',
        data: {
            type: 'due_date_reminder',
        },
    });
}

/**
 * Send Habit-Based Scan Reminder
 */
export async function sendHabitNotification(token: string): Promise<string | null> {
    return sendNotification(token, {
        title: 'Scan reminder',
        body: "It's usually a good time to scan. Only if you need to.",
        data: {
            type: 'habit_reminder',
        },
    });
}
