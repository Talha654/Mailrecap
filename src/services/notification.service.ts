/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * 
 * Handles push notification setup, token management, and notification receiving.
 * This service operates automatically with no manual user controls.
 */

import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { getFirestore, getAuth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = 'fcm_permission_requested';

/**
 * Initialize FCM notifications on app start
 * Should be called once when the app starts
 */
export async function initializeNotifications(): Promise<void> {
    try {
        console.log('[FCM] Initializing notifications...');

        // Request permission (iOS primarily)
        const permissionGranted = await requestNotificationPermission();

        if (permissionGranted) {
            // Get and store FCM token
            await registerFCMToken();

            // Set up token refresh listener
            setupTokenRefreshListener();

            // Set up foreground notification handler
            setupForegroundHandler();

            // Set up background notification handler
            setupBackgroundHandler();

            console.log('[FCM] Notifications initialized successfully');
        } else {
            console.log('[FCM] Notification permission not granted');
        }
    } catch (error) {
        console.error('[FCM] Error initializing notifications:', error);
    }
}

/**
 * Request notification permission from the user
 * On iOS, this shows the permission dialog
 * On Android 13+, this also shows the permission dialog
 */
async function requestNotificationPermission(): Promise<boolean> {
    try {
        // Check if we've already requested permission
        const alreadyRequested = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);

        // Check current permission status
        const authStatus = await messaging().hasPermission();

        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            console.log('[FCM] Permission already granted');
            return true;
        }

        if (authStatus === messaging.AuthorizationStatus.DENIED) {
            console.log('[FCM] Permission previously denied');
            return false;
        }

        // Request permission
        const newAuthStatus = await messaging().requestPermission();
        await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');

        const enabled =
            newAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            newAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log('[FCM] Permission request result:', enabled ? 'granted' : 'denied');
        return enabled;
    } catch (error) {
        console.error('[FCM] Error requesting permission:', error);
        return false;
    }
}

/**
 * Get FCM token and store it in Firestore for the current user
 */
async function registerFCMToken(retryCount = 0): Promise<void> {
    try {
        // Build retry delay: 1s, 2s, 4s
        if (retryCount > 0) {
            const delay = Math.pow(2, retryCount - 1) * 1000;
            console.log(`[FCM] Retrying token registration in ${delay}ms... (Attempt ${retryCount + 1}/4)`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const token = await messaging().getToken();

        if (!token) {
            console.warn('[FCM] No token received');
            return;
        }

        console.log('[FCM] Token received:', token.substring(0, 20) + '...');

        // Store token in Firestore for the current user
        await storeFCMToken(token);
    } catch (error: any) {
        console.error('[FCM] Error registering token:', error);

        // Retry on specific networking/internal errors up to 3 times
        if (retryCount < 3) {
            const errorMessage = error?.message || '';
            if (errorMessage.includes('TLS') ||
                errorMessage.includes('network') ||
                errorMessage.includes('unknown') ||
                errorMessage.includes('operation couldn’t be completed')) {
                await registerFCMToken(retryCount + 1);
            }
        }
    }
}

/**
 * Store FCM token in Firestore user document
 */
async function storeFCMToken(token: string): Promise<void> {
    try {
        const db = getFirestore();
        const auth = getAuth();

        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                console.log('[FCM] User not authenticated, token not stored');
                return;
            }
            userId = storedUserId;
        }

        // Update user document with FCM token
        await db.collection('users').doc(userId).set({
            fcmToken: token,
            fcmTokenUpdatedAt: new Date(),
            notificationsEnabled: true,
        }, { merge: true });

        console.log('[FCM] Token stored in Firestore for user:', userId);
    } catch (error) {
        console.error('[FCM] Error storing token:', error);
    }
}

/**
 * Set up listener for FCM token refresh
 * Tokens can be refreshed at any time, so we need to update Firestore
 */
function setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (newToken) => {
        console.log('[FCM] Token refreshed');
        await storeFCMToken(newToken);
    });
}

/**
 * Set up handler for notifications received while app is in foreground
 */
function setupForegroundHandler(): void {
    messaging().onMessage(async (remoteMessage) => {
        console.log('[FCM] Foreground notification received:', remoteMessage);

        // The notification is automatically displayed by the system
        // We can add custom handling here if needed (e.g., in-app toast)
    });
}

/**
 * Set up handler for background/quit state notifications
 * This needs to be registered at app startup
 */
function setupBackgroundHandler(): void {
    // This handler is called when the app is in background or quit
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('[FCM] Background notification received:', remoteMessage);
        // Handle the notification silently
        // The system will show the notification automatically
    });
}

/**
 * Update FCM token when user logs in
 * Should be called after successful authentication
 */
export async function onUserLogin(): Promise<void> {
    try {
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
            await registerFCMToken();
        }
    } catch (error) {
        console.error('[FCM] Error on user login:', error);
    }
}

/**
 * Clear FCM token when user logs out
 * Should be called before signing out
 */
export async function onUserLogout(): Promise<void> {
    try {
        const db = getFirestore();
        const auth = getAuth();

        const userId = auth.currentUser?.uid;
        if (userId) {
            // Remove FCM token from user document
            await db.collection('users').doc(userId).update({
                fcmToken: null,
                fcmTokenUpdatedAt: new Date(),
            });
            console.log('[FCM] Token cleared for user:', userId);
        }

        // Delete the local token
        await messaging().deleteToken();
        console.log('[FCM] Local token deleted');
    } catch (error) {
        console.error('[FCM] Error on user logout:', error);
    }
}

/**
 * Check if notifications are enabled for the current user
 */
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const authStatus = await messaging().hasPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
        console.error('[FCM] Error checking notification status:', error);
        return false;
    }
}
