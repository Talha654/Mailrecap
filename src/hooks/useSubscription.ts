import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { revenueCatService } from '../services/revenueCat.service';

export interface SubscriptionState {
    subscriptionPlan: string | null;
    scansLeft: number | null;
    daysLeft: number | null;
    loading: boolean;
}

export const useSubscription = (): SubscriptionState => {
    const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
    const [scansLeft, setScansLeft] = useState<number | null>(null);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Identify user in RevenueCat and then sync
        revenueCatService.login(user.uid).then(() => {
            revenueCatService.syncSubscriptionStatus();
        });


        const unsubscribe = firestore()
            .collection('users')
            .doc(user.uid)
            .onSnapshot(
                (doc) => {
                    if (doc?.exists()) {
                        const data = doc.data();
                        const plan = data?.subscriptionPlan || 'free_trial'; // Default to free_trial if not set
                        setSubscriptionPlan(plan);

                        // Calculate scans left (assuming 'scansRemaining' field exists, or logic based on plan)
                        // For essentials, we might track usage. For now, let's try to get a field or default.
                        setScansLeft(data?.scansRemaining ?? 10); // Default 10 for essentials if not tracked yet

                        // Calculate days left for trial
                        if (plan === 'free_trial') {
                            const trialStart = data?.createdAt?.toDate() || new Date(); // Fallback to now if missing
                            // Assuming 7 days trial
                            const trialEnd = new Date(trialStart);
                            trialEnd.setDate(trialEnd.getDate() + 7);
                            const now = new Date();
                            const diffTime = Math.abs(trialEnd.getTime() - now.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            // If trial expired, it might be 0 or negative, handle display logic in UI or here.
                            // For now, let's just return the diff.
                            // If now > trialEnd, it's 0.
                            const days = diffDays;
                            if (now > trialEnd) {
                                setDaysLeft(0);
                                setSubscriptionPlan('no_plan');
                            } else {
                                setDaysLeft(diffDays);
                            }
                        } else {
                            setDaysLeft(null);
                        }
                    } else {
                        // Doc doesn't exist, maybe new user? Default to free trial
                        setSubscriptionPlan('free_trial');
                        setDaysLeft(7);
                        setScansLeft(null);
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('Error fetching subscription:', error);
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, []);

    return { subscriptionPlan, scansLeft, daysLeft, loading };
};
