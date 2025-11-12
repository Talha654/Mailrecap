import { getAuth } from './firebase';
import { createUserDocument } from './user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function signInWithEmailPassword(email: string, password: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
        throw new Error('EMAIL_PASSWORD_REQUIRED');
    }
    const res = await getAuth().signInWithEmailAndPassword(trimmedEmail, password);
    
    // Save user ID to AsyncStorage
    if (res.user) {
        await AsyncStorage.setItem('userId', res.user.uid);
        await AsyncStorage.setItem('userEmail', res.user.email || '');
        console.log('[Auth] User ID saved to AsyncStorage:', res.user.uid);
    }
    
    return res.user;
}

export async function signUpWithEmailPassword(email: string, password: string, displayName?: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
        throw new Error('EMAIL_PASSWORD_REQUIRED');
    }
    const cred = await getAuth().createUserWithEmailAndPassword(trimmedEmail, password);
    if (displayName) {
        await cred.user.updateProfile({ displayName });
    }
    
    // Create user document in Firestore
    await createUserDocument(cred.user.uid, trimmedEmail, displayName);
    
    // Save user ID to AsyncStorage
    await AsyncStorage.setItem('userId', cred.user.uid);
    await AsyncStorage.setItem('userEmail', cred.user.email || '');
    console.log('[Auth] User ID saved to AsyncStorage:', cred.user.uid);
    
    return cred.user;
}

export async function signOut() {
    await getAuth().signOut();
    
    // Clear user data from AsyncStorage
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userEmail');
    console.log('[Auth] User data cleared from AsyncStorage');
}

export function onAuthStateChanged(callback: (user: any) => void) {
    return getAuth().onAuthStateChanged(callback);
}


