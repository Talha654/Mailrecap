import { getAuth } from './firebase';

export async function signInWithEmailPassword(email: string, password: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
        throw new Error('EMAIL_PASSWORD_REQUIRED');
    }
    const res = await getAuth().signInWithEmailAndPassword(trimmedEmail, password);
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
    return cred.user;
}

export async function signOut() {
    await getAuth().signOut();
}

export function onAuthStateChanged(callback: (user: any) => void) {
    return getAuth().onAuthStateChanged(callback);
}


