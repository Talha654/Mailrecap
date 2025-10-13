import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

export function getFirebaseApp() {
    // Native config auto-initializes the default app
    return app.app();
}

export function getAuth() {
    return auth();
}


