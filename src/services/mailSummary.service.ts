import firestore from '@react-native-firebase/firestore';
import { getFirestore, getAuth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Actionable date extracted from mail by AI
 * Used for due date reminder notifications
 */
export interface ActionableDate {
    date: string;  // YYYY-MM-DD format
    type: 'payment' | 'deadline' | 'appointment' | 'expiry' | 'other';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
}

export interface MailSummary {
    id: string;
    userId: string;
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    photoUrl?: string;
    audioUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    actionableDate?: ActionableDate;
    isCompleted?: boolean;
    links?: string[];
    category?: string;
}

export interface MailSummaryInput {
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    photoUrl?: string;
    audioUrl?: string;
    actionableDate?: ActionableDate;
    isCompleted?: boolean;
    links?: string[];
    category?: string;
}

/**
 * Save a scanned mail summary to Firestore
 */
export async function saveMailSummary(data: MailSummaryInput): Promise<MailSummary> {
    try {
        const db = getFirestore();
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

        // Prepare actionable date for Firestore if present
        let actionableDateForStorage = undefined;
        if (data.actionableDate && data.actionableDate.confidence) {
            actionableDateForStorage = {
                date: new Date(data.actionableDate.date),  // Convert YYYY-MM-DD string to Date
                type: data.actionableDate.type,
                confidence: data.actionableDate.confidence,
                description: data.actionableDate.description,
            };
        }

        const mailSummaryData: any = {
            userId,
            title: data.title,
            summary: data.summary,
            fullText: data.fullText,
            suggestions: data.suggestions,
            photoUrl: data.photoUrl || undefined,
            audioUrl: data.audioUrl || undefined,
            createdAt: now,
            updatedAt: now,
            isCompleted: data.isCompleted || false,
            links: data.links || [],
            category: data.category || 'General',
        };

        // Only add actionableDate if it exists
        if (actionableDateForStorage) {
            mailSummaryData.actionableDate = actionableDateForStorage;
        }

        // Add document to Firestore
        const docRef = await db
            .collection('mailSummaries')
            .add(mailSummaryData);

        // Check and update scan limits
        const userRef = db.collection('users').doc(userId);
        const userDoc: any = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const scansRemaining = userData?.scansRemaining;

            // If scansRemaining is defined
            if (typeof scansRemaining === 'number') {
                if (scansRemaining > 0) {
                    await userRef.update({
                        scansRemaining: firestore.FieldValue.increment(-1)
                    });
                    console.log('[MailSummary] Decremented scan count. New count:', scansRemaining - 1);
                } else if (scansRemaining === 0) {
                    console.warn('[MailSummary] Warning: Saving summary with 0 scans remaining');
                } else if (scansRemaining === -1) {
                    console.log('[MailSummary] User has unlimited scans');
                }
            } else {
                // If scansRemaining is undefined (legacy users or error), default to 10 and decrement 1 -> 9
                // Only do this if they are NOT on a paid plan that should be unlimited
                // Safest bet: if it's undefined, we assume they are on a basic/free tier that defaults to 10.
                // If they truly have a plan, revenueCat sync should have set it, but let's be safe.
                console.log('[MailSummary] scansRemaining undefined. Initializing to 9 (10 - 1)');
                await userRef.update({
                    scansRemaining: 9
                });
            }
        }

        // Log scan time for habit-based notification analysis
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            await db.collection('userScanHistory').doc(userId).collection('scans').add({
                scannedAt: now,
                localTimeHour: now.getHours(),
                localTimeMinute: now.getMinutes(),
                dayOfWeek: now.getDay(),
                timezone: timezone,
            });
            console.log('[MailSummary] Scan history logged for habit analysis');
        } catch (scanHistoryError) {
            // Non-blocking - don't fail the save if scan history logging fails
            console.warn('[MailSummary] Failed to log scan history:', scanHistoryError);
        }

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
                audioUrl: data.audioUrl || undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                isCompleted: data.isCompleted || false,
                links: data.links || [],
                category: data.category || 'General',
                actionableDate: data.actionableDate ? {
                    date: data.actionableDate.date.toDate().toISOString().split('T')[0], // Convert Timestamp back to YYYY-MM-DD
                    type: data.actionableDate.type,
                    confidence: data.actionableDate.confidence,
                    description: data.actionableDate.description,
                } : undefined
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
            audioUrl: data.audioUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isCompleted: data.isCompleted || false,
            links: data.links || [],
            category: data.category || 'General',
            actionableDate: data.actionableDate ? {
                date: data.actionableDate.date.toDate().toISOString().split('T')[0],
                type: data.actionableDate.type,
                confidence: data.actionableDate.confidence,
                description: data.actionableDate.description,
            } : undefined
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
