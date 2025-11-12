import { Platform } from 'react-native';
import { PlanType } from '../types/iap';

/**
 * Product IDs for iOS (App Store)
 * Replace these with your actual App Store product IDs
 */
const IOS_PRODUCT_IDS = {
  basic: 'com.mailrecap.basic.monthly',
  unlimited: 'com.mailrecap.unlimited.monthly',
};

/**
 * Product IDs for Android (Google Play)
 * Replace these with your actual Google Play product IDs
 */
const ANDROID_PRODUCT_IDS = {
  basic: 'mailrecap_basic_monthly',
  unlimited: 'mailrecap_unlimited_monthly',
};

/**
 * Get platform-specific product IDs
 */
export const getProductIds = (): Record<PlanType, string> => {
  return Platform.OS === 'ios' ? IOS_PRODUCT_IDS : ANDROID_PRODUCT_IDS;
};

/**
 * Get all product IDs as an array
 */
export const getAllProductIds = (): string[] => {
  const productIds = getProductIds();
  return Object.values(productIds);
};

/**
 * Get product ID for a specific plan
 */
export const getProductIdForPlan = (planType: PlanType): string => {
  const productIds = getProductIds();
  return productIds[planType];
};

/**
 * Get plan type from product ID
 */
export const getPlanTypeFromProductId = (productId: string): PlanType | null => {
  const productIds = getProductIds();
  const entry = Object.entries(productIds).find(([_, id]) => id === productId);
  return entry ? (entry[0] as PlanType) : null;
};

/**
 * IAP Configuration
 */
export const IAP_CONFIG = {
  // Enable sandbox mode for testing (set to false in production)
  enableSandbox: __DEV__,
  
  // Auto-finish transactions (recommended for consumables, be careful with subscriptions)
  autoFinishTransactions: false,
  
  // Purchase timeout in milliseconds
  purchaseTimeout: 60000,
  
  // Development mode - simulates purchases without real product IDs (for UI testing only)
  // Set to false when you have real product IDs configured
  // WARNING: Setting to false without real products will cause "Invalid product ID" errors
  // See ENABLE_REAL_PAYMENTS.md for setup instructions
  developmentMode: true,  // Change to false to see Google Pay/Apple Pay UI
};
