import { Product, Subscription, Purchase } from 'react-native-iap';

export type PlanType = 'basic' | 'unlimited';

export interface IAPProduct {
  planType: PlanType;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  purchase?: Purchase;
  error?: string;
}

export interface IAPState {
  isInitialized: boolean;
  products: Product[] | Subscription[];
  isLoading: boolean;
  error: string | null;
}

export enum PurchaseError {
  USER_CANCELLED = 'USER_CANCELLED',
  PAYMENT_INVALID = 'PAYMENT_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  ALREADY_OWNED = 'ALREADY_OWNED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}
