export type PlanType =
  | 'free_trial'
  | 'essentials_monthly'
  | 'essentials_yearly'
  | 'plus_monthly'
  | 'plus_yearly'
  | 'essentials_monthly:essentials-monthly'
  | 'essentials_yearly:essentials-yearly'
  | 'plus_monthly:plus-monthly'
  | 'plus_yearly:plus-yearly';


export interface SubscriptionProduct {
  planType: PlanType;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  customerInfo?: any;
}

export enum PurchaseError {
  USER_CANCELLED = 'USER_CANCELLED',
  PAYMENT_INVALID = 'PAYMENT_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  ALREADY_OWNED = 'ALREADY_OWNED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}
