import { getFirestore } from './firebase';

export interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function createUserDocument(uid: string, email: string, displayName?: string) {
    const userData: UserData = {
        uid,
        email,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    await getFirestore().collection('users').doc(uid).set(userData);
    return userData;
}

export async function getUserDocument(uid: string) {
    const doc = await getFirestore().collection('users').doc(uid).get();
    return doc.exists() ? doc.data() as UserData : null;
}