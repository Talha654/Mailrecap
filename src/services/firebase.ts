import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import storage from '@react-native-firebase/storage';

export function getFirebaseApp() {
    // Native config auto-initializes the default app
    return app.app();
}

export function getAuth() {
    return auth();
}

export function getFirestore() {
    return firestore();
}

export function getMessaging() {
    return messaging();
}

export function getStorage() {
    return storage();
}


