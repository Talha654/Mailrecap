import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { Platform, Alert } from 'react-native';
import { getRevenueCatApiKey, REVENUECAT_CONFIG } from '../config/revenueCat.config';
import { PlanType } from '../types/subscription';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RevenueCatService {
    private isInitialized = false;
    private offerings: PurchasesOffering[] = [];

    /**
     * Initialize RevenueCat
     */
    async initialize(appUserId?: string): Promise<boolean> {
        try {
            if (this.isInitialized) {
                console.log('[RevenueCat] Already initialized');
                return true;
            }

            const apiKey = getRevenueCatApiKey();
            console.log('[RevenueCat] Initializing with API key...');

            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            Purchases.configure({
                apiKey,
                appUserID: appUserId || undefined,
            });

            this.isInitialized = true;
            console.log('[RevenueCat] Initialized successfully');

            // Load offerings immediately
            await this.loadOfferings();

            return true;
        } catch (error) {
            console.error('[RevenueCat] Initialization error:', error);
            return false;
        }
    }

    /**
     * Load available offerings
     * Returns all available packages from all offerings
     */
    async loadOfferings(): Promise<PurchasesPackage[]> {
        try {
            console.log('[RevenueCat] Fetching offerings...');
            const offerings = await Purchases.getOfferings();

            // Collect all packages from all offerings
            const allPackages: PurchasesPackage[] = [];

            // Get packages from current offering if available
            if (offerings.current !== null) {
                allPackages.push(...offerings.current.availablePackages);
            }

            // Get packages from all other offerings
            Object.values(offerings.all).forEach((offering) => {
                if (offering !== offerings.current) {
                    allPackages.push(...offering.availablePackages);
                }
            });

            if (allPackages.length > 0) {
                console.log('[RevenueCat] ✅ Offerings loaded successfully');
                console.log('[RevenueCat] Total available packages:', allPackages.length);
                console.log('[RevenueCat] ========================================');
                console.log('[RevenueCat] AVAILABLE PRODUCTS (use these IDs):');
                console.log('[RevenueCat] ========================================');
                allPackages.forEach((pkg, index) => {
                    console.log(`[RevenueCat] Package ${index + 1}:`);
                    console.log(`  - Package Identifier: ${pkg.identifier}`);
                    console.log(`  - Product ID: ${pkg.product.identifier}`);
                    console.log(`  - Price: ${pkg.product.priceString}`);
                    console.log(`  - Title: ${pkg.product.title}`);
                    console.log(`  - Description: ${pkg.product.description}`);
                    console.log('  ---');
                });
                console.log('[RevenueCat] ========================================');
                return allPackages;
            } else {
                console.error('[RevenueCat] ⚠️ No packages available in any offering');
                console.error('[RevenueCat] This usually means:');
                console.error('[RevenueCat] 1. Products are not configured in RevenueCat Dashboard');
                console.error('[RevenueCat] 2. Products are not linked to App Store Connect / Play Console');
                console.error('[RevenueCat] 3. Offerings exist but have no packages');
                console.error('[RevenueCat] Visit: https://rev.cat/why-are-offerings-empty');
                return [];
            }
        } catch (error: any) {
            console.error('[RevenueCat] 🔴 Error loading offerings:', error);
            console.error('[RevenueCat] Error details:', {
                message: error?.message,
                code: error?.code,
                underlyingError: error?.underlyingErrorMessage,
            });
            console.error('[RevenueCat] Check your RevenueCat Dashboard configuration');
            return [];
        }
    }
    /**
     * Purchase a package
     */
    async purchasePlan(rcPackage: PurchasesPackage, planType: PlanType): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: any }> {
        try {
            console.log(`[RevenueCat] Purchasing plan: ${planType}`);
            const { customerInfo } = await Purchases.purchasePackage(rcPackage);

            // Determine which entitlement to check based on plan type
            let entitlementId: string;
            if (planType.includes('essentials')) {
                entitlementId = REVENUECAT_CONFIG.entitlements.premium;
            } else if (planType.includes('plus')) {
                entitlementId = REVENUECAT_CONFIG.entitlements.plus;
            } else {
                // Fallback to premium
                entitlementId = REVENUECAT_CONFIG.entitlements.premium;
            }

            console.log(`[RevenueCat] Checking for entitlement: ${entitlementId}`);

            // Verify entitlement (Case Insensitive)
            const activeEntitlements = Object.keys(customerInfo.entitlements.active);
            const hasEntitlement = activeEntitlements.some(
                activeId => activeId.toLowerCase() === entitlementId.toLowerCase()
            );

            if (hasEntitlement) {
                console.log('[RevenueCat] ✅ Purchase successful and entitlement verified');

                // Sync with our database (parity with old IAP service)
                await this.savePurchaseToDatabase(customerInfo, planType, rcPackage.product.identifier);

                return { success: true, customerInfo };
            }

            console.error('[RevenueCat] ⚠️ Purchase completed but entitlement not found');
            console.error('[RevenueCat] Expected entitlement:', entitlementId);
            console.error('[RevenueCat] Active entitlements:', Object.keys(customerInfo.entitlements.active));
            return { success: false, error: 'Entitlement not active after purchase' };
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('[RevenueCat] Purchase error:', error);
            }
            return { success: false, error };
        }
    }

    /**
     * Restore purchases
     */
    async restorePurchases(): Promise<CustomerInfo | null> {
        try {
            console.log('[RevenueCat] Restoring purchases...');
            const customerInfo = await Purchases.restorePurchases();

            console.log('[RevenueCat] Restore successful');

            // Check for active entitlements and sync to DB
            const activeEntitlements = Object.keys(customerInfo.entitlements.active).map(id => id.toLowerCase());
            const hasPremium = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.premium.toLowerCase());
            const hasPlus = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.plus.toLowerCase());

            if (hasPremium || hasPlus) {
                console.log('[RevenueCat] Active entitlement found after restore. Syncing to DB...');

                // Determine which plan to sync
                // We default to the "highest" tier if both exist, or just the one found
                const planType = hasPlus ? 'plus_yearly' : 'essentials_yearly'; // Approximate plan type mapping
                // Note: Exact plan type (monthly/yearly) might be hard to guess perfectly from just entitlement check 
                // without inspecting the specific product ID, but entitlement is what matters for access.
                // Let's try to be more precise if possible checking product identifier

                let matchedProductIdentifier = '';
                const activeEntitlementId = hasPlus ? REVENUECAT_CONFIG.entitlements.plus : REVENUECAT_CONFIG.entitlements.premium;

                // Find the actual entitlement object to get product identifier
                const entitlementObj = Object.values(customerInfo.entitlements.active).find(
                    ent => ent.identifier.toLowerCase() === activeEntitlementId.toLowerCase()
                );

                if (entitlementObj) {
                    matchedProductIdentifier = entitlementObj.productIdentifier;
                    // Try to guess plan type from product ID
                    let derivedPlanType: PlanType = hasPlus ? 'plus_yearly' : 'essentials_yearly';
                    if (matchedProductIdentifier.includes('monthly')) {
                        derivedPlanType = hasPlus ? 'plus_monthly' : 'essentials_monthly';
                    } else if (matchedProductIdentifier.includes('yearly')) {
                        derivedPlanType = hasPlus ? 'plus_yearly' : 'essentials_yearly';
                    }

                    await this.savePurchaseToDatabase(customerInfo, derivedPlanType, matchedProductIdentifier);
                }
            }

            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Restore error:', error);
            return null;
        }
    }

    /**
     * Check if user has active entitlement
     * Returns true if user has either premium or plus entitlement
     */
    async checkEntitlement(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const activeEntitlements = Object.keys(customerInfo.entitlements.active).map(id => id.toLowerCase());

            const hasPremium = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.premium.toLowerCase());
            const hasPlus = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.plus.toLowerCase());

            return hasPremium || hasPlus;
        } catch (error) {
            console.error('[RevenueCat] Error checking entitlement:', error);
            return false;
        }
    }

    /**
     * Save purchase to Firestore for administrative tracking
     * (Maintains parity with the previous IAP implementation)
     */
    private async savePurchaseToDatabase(customerInfo: CustomerInfo, planType: PlanType, productId: string): Promise<void> {
        try {
            let user = auth().currentUser;
            let userId: string | undefined = user?.uid || customerInfo.originalAppUserId;
            let userEmail: string | undefined = user?.email || undefined;

            if (!userId) {
                const storedUserId = await AsyncStorage.getItem('userId');
                userId = storedUserId || undefined;
            }

            if (!userId) {
                console.log('[RevenueCat] ⚠️ No user ID found, skipping database save');
                return;
            }

            console.log('[RevenueCat] 💾 Syncing purchase to Firestore...');



            // Find the active entitlement to get the purchase date
            const activeEntitlements = customerInfo.entitlements.active;
            const entitlementId = planType.includes('plus')
                ? REVENUECAT_CONFIG.entitlements.plus
                : REVENUECAT_CONFIG.entitlements.premium;

            // Case-insensitive lookup
            const activeEntitlementKey = Object.keys(activeEntitlements).find(
                key => key.toLowerCase() === entitlementId.toLowerCase()
            );

            const transactionId = activeEntitlementKey
                ? activeEntitlements[activeEntitlementKey].latestPurchaseDate
                : `rc_${Date.now()}`;

            const expirationDate = activeEntitlementKey
                ? activeEntitlements[activeEntitlementKey].expirationDate
                : null;

            const expirationDateObj = expirationDate ? new Date(expirationDate) : null;
            const isExpired = expirationDateObj && new Date() > expirationDateObj;

            const finalStatus = isExpired ? 'expired' : 'active';
            const finalPlanType = isExpired ? 'no_plan' : planType;

            const purchaseData = {
                userId,
                email: userEmail || 'unknown',
                planType,
                productId,
                transactionId,
                platform: Platform.OS,
                purchaseDate: firestore.FieldValue.serverTimestamp(),
                expirationDate: expirationDate ? firestore.Timestamp.fromMillis(new Date(expirationDate).getTime()) : null,
                status: finalStatus,
                source: 'revenuecat',
                verifiedAt: firestore.FieldValue.serverTimestamp(),
            };

            // Check if this transaction has already been processed
            const purchaseDoc = await firestore()
                .collection('purchases')
                .doc(transactionId.toString())
                .get();

            // Handle possibility of exists being a function (web SDK) or property (native SDK)
            // Linter suggests it's a function, but other files use property.
            const exists = purchaseDoc.exists;
            const isExistingTransaction = typeof exists === 'function' ? purchaseDoc.exists() : exists;

            if (!isExistingTransaction) {
                // Save to purchases collection only if it's new
                await firestore()
                    .collection('purchases')
                    .doc(transactionId.toString())
                    .set(purchaseData);
            }

            // Fetch current user data to preserve scansRemaining if needed
            const userRef = firestore().collection('users').doc(userId);
            const userSnapshot = await userRef.get();
            const userData = userSnapshot.data();

            let scansRemaining = planType.includes('plus') ? -1 : 10;

            if (!isExpired) {
                if (isExistingTransaction) {
                    // If transaction exists, this is just a sync/restore (e.g. app restart)
                    // We MUST preserve the existing scan count from the user's profile
                    // unless it's undefined, in which case we might default (but careful not to overwrite valid 0)
                    if (userData?.scansRemaining !== undefined) {
                        scansRemaining = userData.scansRemaining;
                        console.log(`[RevenueCat] Existing transaction ${transactionId}. Preserving count: ${scansRemaining}`);
                    } else {
                        // If undefined but transaction exists, it might be the "missing field" bug we just fixed.
                        console.log(`[RevenueCat] Existing transaction but no scan count. Defaulting to: ${scansRemaining}`);
                    }
                } else {
                    // New transaction (New purchase or Renewal)
                    console.log(`[RevenueCat] New transaction ${transactionId}. Refilling scans to: ${scansRemaining}`);
                }
            } else {
                console.log(`[RevenueCat] Subscription expired. Leaving scansRemaining as is or handling elsewhere.`);
                // Ideally we shouldn't reset scans if expired, but if we switch to no_plan, scans might be irrelevant or 0.
                // Let's keep existing if possible, or maybe set to 0? 
                // For now, let's strictly preserve what's there if userData exists.
                if (userData?.scansRemaining !== undefined) {
                    scansRemaining = userData.scansRemaining;
                } else {
                    scansRemaining = 0; // Default for expired/no_plan
                }
            }


            // Remove the old "preserve if plan matches" logic as it prevents legitimate renewals
            // and is superseded by the transaction ID check.

            // Update user's subscription status
            const userUpdateData: any = {
                subscriptionPlan: finalPlanType,
                subscriptionStatus: finalStatus,
                lastPurchaseDate: firestore.FieldValue.serverTimestamp(),
                subscriptionEndDate: expirationDate ? firestore.Timestamp.fromMillis(new Date(expirationDate).getTime()) : null,
                revenueCatId: customerInfo.originalAppUserId,
                scansRemaining: scansRemaining,
            };

            if (!isExpired) {
                userUpdateData.planConfig = {
                    type: planType.includes('plus') ? 'plus' : 'essentials',
                    interval: planType.includes('yearly') ? 'year' : 'month',
                    limit: planType.includes('plus') ? -1 : 10,
                    features: planType.includes('plus')
                        ? ['unlimited_scans', 'tts', 'archive']
                        : ['limited_scans', 'archive']
                };
            }

            await userRef.set(userUpdateData, { merge: true });

            console.log('[RevenueCat] ✅ Purchase synced to database successfully');
        } catch (error: any) {
            console.error('[RevenueCat] ❌ Error syncing purchase to database:', error);
        }
    }
    async syncSubscriptionStatus(): Promise<void> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const activeEntitlements = Object.keys(customerInfo.entitlements.active).map(id => id.toLowerCase());

            const hasPremium = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.premium.toLowerCase());
            const hasPlus = activeEntitlements.includes(REVENUECAT_CONFIG.entitlements.plus.toLowerCase());
            if (hasPremium || hasPlus) {
                console.log('[RevenueCat] Active entitlement found during sync. Updating DB...');

                const activeEntitlementId = hasPlus ? REVENUECAT_CONFIG.entitlements.plus : REVENUECAT_CONFIG.entitlements.premium;

                // Find the actual entitlement object to get product identifier
                const entitlementObj = Object.values(customerInfo.entitlements.active).find(
                    ent => ent.identifier.toLowerCase() === activeEntitlementId.toLowerCase()
                );

                if (entitlementObj) {
                    const matchedProductIdentifier = entitlementObj.productIdentifier;
                    let derivedPlanType: PlanType = hasPlus ? 'plus_yearly' : 'essentials_yearly';

                    if (matchedProductIdentifier.includes('monthly')) {
                        derivedPlanType = hasPlus ? 'plus_monthly' : 'essentials_monthly';
                    } else if (matchedProductIdentifier.includes('yearly')) {
                        derivedPlanType = hasPlus ? 'plus_yearly' : 'essentials_yearly';
                    }

                    await this.savePurchaseToDatabase(customerInfo, derivedPlanType, matchedProductIdentifier);
                }
            }
        } catch (error) {
            console.error('[RevenueCat] Error syncing subscription status:', error);
        }
    }

    /**
     * Identify user in RevenueCat
     */
    async login(appUserId: string): Promise<CustomerInfo | null> {
        try {
            console.log(`[RevenueCat] Logging in as ${appUserId}...`);
            const { customerInfo } = await Purchases.logIn(appUserId);
            console.log('[RevenueCat] Login successful');
            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Login error:', error);
            return null;
        }
    }

    /**
     * Logout from RevenueCat
     */
    async logout(): Promise<void> {
        try {
            console.log('[RevenueCat] Logging out...');
            await Purchases.logOut();
            console.log('[RevenueCat] Logout successful');
        } catch (error) {
            console.error('[RevenueCat] Logout error:', error);
        }
    }
}

export const revenueCatService = new RevenueCatService();
