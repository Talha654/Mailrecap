import { getFirestore } from './firebase';

export interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    updatedAt: Date;
    scansRemaining?: number;
}

export async function createUserDocument(uid: string, email: string, displayName?: string) {
    const userData: UserData = {
        uid,
        email,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
        scansRemaining: 10,
    };

    await getFirestore().collection('users').doc(uid).set(userData);
    return userData;
}

export async function getUserDocument(uid: string) {
    const doc = await getFirestore().collection('users').doc(uid).get();
    return doc.exists() ? doc.data() as UserData : null;
}

/**
 * Find an orphaned user document by email.
 * Used when a user re-signs up after deleting their account (but data wasn't deleted).
 * Returns the uid or revenueCatId of the most recent account found.
 */
export async function findOrphanedUserByEmail(email: string, excludeUid?: string): Promise<string | null> {
    try {
        // Query by email only (no orderBy) to avoid needing a composite index
        const snapshot = await getFirestore()
            .collection('users')
            .where('email', '==', email)
            .get();

        if (snapshot.empty) {
            return null;
        }

        // Filter out the current user (excludeUid) and map
        let docs = snapshot.docs
            .filter(doc => doc.id !== excludeUid)
            .map(doc => ({
                id: doc.id,
                data: doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(0)
            }));

        if (docs.length === 0) {
            return null;
        }

        // Sort in memory to find the most recent one
        // Sort descending by createdAt
        docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const mostRecent = docs[0];
        console.log('[User] Found orphaned account:', mostRecent.id);

        // Return revenueCatId if available (best for linking), otherwise uid
        return mostRecent.data.revenueCatId || mostRecent.data.uid || mostRecent.id;
    } catch (error) {
        console.error('[User] Error finding orphaned user:', error);
        return null;
    }
}