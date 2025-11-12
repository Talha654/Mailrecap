import { getFirestore } from './firebase';
import { getAuth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MailSummary {
    id: string;
    userId: string;
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    photoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MailSummaryInput {
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    photoUrl?: string;
}

/**
 * Save a scanned mail summary to Firestore
 */
export async function saveMailSummary(data: MailSummaryInput): Promise<MailSummary> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        
        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('User not authenticated');
            }
            userId = storedUserId;
        }

        const now = new Date();
        const mailSummaryData = {
            userId,
            title: data.title,
            summary: data.summary,
            fullText: data.fullText,
            suggestions: data.suggestions,
            photoUrl: data.photoUrl || undefined,
            createdAt: now,
            updatedAt: now,
        };

        // Add document to Firestore
        const docRef = await firestore
            .collection('mailSummaries')
            .add(mailSummaryData);

        console.log('[MailSummary] Saved to Firestore with ID:', docRef.id);

        return {
            id: docRef.id,
            ...mailSummaryData,
        };
    } catch (error) {
        console.error('[MailSummary] Error saving to Firestore:', error);
        throw error;
    }
}

/**
 * Get all mail summaries for the current user
 */
export async function getUserMailSummaries(): Promise<MailSummary[]> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        
        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('User not authenticated');
            }
            userId = storedUserId;
        }

        const snapshot = await firestore
            .collection('mailSummaries')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const summaries: MailSummary[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            summaries.push({
                id: doc.id,
                userId: data.userId,
                title: data.title,
                summary: data.summary,
                fullText: data.fullText,
                suggestions: data.suggestions || [],
                photoUrl: data.photoUrl || undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        console.log('[MailSummary] Retrieved', summaries.length, 'summaries from Firestore');
        return summaries;
    } catch (error) {
        console.error('[MailSummary] Error fetching from Firestore:', error);
        throw error;
    }
}

/**
 * Get a single mail summary by ID
 */
export async function getMailSummaryById(summaryId: string): Promise<MailSummary | null> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        
        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('User not authenticated');
            }
            userId = storedUserId;
        }

        const doc = await firestore
            .collection('mailSummaries')
            .doc(summaryId)
            .get();

        if (!doc.exists) {
            console.log('[MailSummary] Document not found:', summaryId);
            return null;
        }

        const data = doc.data();
        
        // Verify the summary belongs to the current user
        if (data?.userId !== userId) {
            console.log('[MailSummary] Access denied: summary belongs to different user');
            return null;
        }

        return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            summary: data.summary,
            fullText: data.fullText,
            suggestions: data.suggestions || [],
            photoUrl: data.photoUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('[MailSummary] Error fetching summary by ID:', error);
        throw error;
    }
}

/**
 * Delete a mail summary
 */
export async function deleteMailSummary(summaryId: string): Promise<void> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        
        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('User not authenticated');
            }
            userId = storedUserId;
        }

        // First verify the summary belongs to the current user
        const doc = await firestore
            .collection('mailSummaries')
            .doc(summaryId)
            .get();

        if (!doc.exists) {
            throw new Error('Summary not found');
        }

        const data = doc.data();
        if (data?.userId !== userId) {
            throw new Error('Access denied: cannot delete another user\'s summary');
        }

        // Delete the document
        await firestore
            .collection('mailSummaries')
            .doc(summaryId)
            .delete();

        console.log('[MailSummary] Deleted summary:', summaryId);
    } catch (error) {
        console.error('[MailSummary] Error deleting summary:', error);
        throw error;
    }
}

/**
 * Update a mail summary
 */
export async function updateMailSummary(
    summaryId: string,
    updates: Partial<MailSummaryInput>
): Promise<void> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        
        // Get user ID from auth or AsyncStorage
        let userId = auth.currentUser?.uid;
        if (!userId) {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('User not authenticated');
            }
            userId = storedUserId;
        }

        // First verify the summary belongs to the current user
        const doc = await firestore
            .collection('mailSummaries')
            .doc(summaryId)
            .get();

        if (!doc.exists) {
            throw new Error('Summary not found');
        }

        const data = doc.data();
        if (data?.userId !== userId) {
            throw new Error('Access denied: cannot update another user\'s summary');
        }

        // Update the document
        await firestore
            .collection('mailSummaries')
            .doc(summaryId)
            .update({
                ...updates,
                updatedAt: new Date(),
            });

        console.log('[MailSummary] Updated summary:', summaryId);
    } catch (error) {
        console.error('[MailSummary] Error updating summary:', error);
        throw error;
    }
}
