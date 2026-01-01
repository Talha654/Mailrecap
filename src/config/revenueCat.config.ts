import { Platform } from 'react-native';

/**
 * RevenueCat Configuration
 * 
 * Get these keys from the RevenueCat Dashboard:
 * https://app.revenuecat.com/
 */
export const REVENUECAT_CONFIG = {
    // Replace with your actual RevenueCat API Keys
    appleApiKey: 'appl_tSPVVbrvmvpWpIkWCgoiaBmJSET',
    googleApiKey: 'goog_mWQZjcqywCTqrmnfBZElxANePoQ',

    // Entitlement identifiers defined in RevenueCat dashboard
    entitlements: {
        premium: 'Premium',
        plus: 'Plus',
    },
};

/**
 * Get the platform-specific API key
 */
export const getRevenueCatApiKey = (): string => {
    return Platform.OS === 'ios'
        ? REVENUECAT_CONFIG.appleApiKey
        : REVENUECAT_CONFIG.googleApiKey;
};
