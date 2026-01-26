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

export const PRODUCT_IDS = {
    ios: {
        essentials_monthly: 'essential_monthly',
        essentials_yearly: 'essential_yearly',
        plus_monthly: 'pluss_monthly',
        plus_yearly: 'pluss_yearly',
    },
    // We can add android here later if needed, or map them similarly
    android: {
        essentials_monthly: 'essentials_monthly:essentials-monthly',
        essentials_yearly: 'essentials_yearly:essentials-yearly',
        plus_monthly: 'plus_monthly:plus-monthly',
        plus_yearly: 'plus_yearly:plus-yearly',
    }
};

/**
 * Get the platform-specific API key
 */
export const getRevenueCatApiKey = (): string => {
    return Platform.OS === 'ios'
        ? REVENUECAT_CONFIG.appleApiKey
        : REVENUECAT_CONFIG.googleApiKey;
};
