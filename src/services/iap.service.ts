import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  Product,
  ProductSubscription,
  Purchase,
  PurchaseError as RNIAPPurchaseError,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { getAllProductIds, getProductIdForPlan, getPlanTypeFromProductId, IAP_CONFIG } from '../config/iap.config';
import { PlanType, PurchaseResult, PurchaseError } from '../types/iap';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

class IAPService {
  private isInitialized = false;
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private products: Product[] = [];
  private subscriptions: ProductSubscription[] = [];

  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('[IAP] Already initialized');
        return true;
      }

      // Development mode - skip real IAP initialization
      if (IAP_CONFIG.developmentMode) {
        console.log('[IAP] 🔧 Development mode enabled - simulating IAP');
        this.isInitialized = true;
        return true;
      }

      console.log('[IAP] Initializing connection...');
      await initConnection();
      
      this.isInitialized = true;
      console.log('[IAP] Connection initialized successfully');

      // Set up purchase listeners
      this.setupPurchaseListeners();

      // Load products
      await this.loadProducts();

      return true;
    } catch (error) {
      console.error('[IAP] Initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Load available products/subscriptions
   */
  async loadProducts(): Promise<Product[]> {
    try {
      const productIds = getAllProductIds();
      console.log('[IAP] Loading products:', productIds);

      // In v14, fetchProducts returns a flat array of products and subscriptions
      const result = await fetchProducts({ skus: productIds });
      
      if (!result) {
        console.log('[IAP] No products returned');
        return [];
      }
      
      // Separate products and subscriptions based on type
      this.products = Array.isArray(result) 
        ? result.filter(item => item.type === 'in-app') as Product[]
        : [];
      this.subscriptions = Array.isArray(result)
        ? result.filter(item => item.type === 'subs') as ProductSubscription[]
        : [];
      
      console.log('[IAP] Loaded products:', this.products.length);
      console.log('[IAP] Loaded subscriptions:', this.subscriptions.length);
      
      return this.products;
    } catch (error) {
      console.error('[IAP] Error loading products:', error);
      return [];
    }
  }

  /**
   * Get loaded products
   */
  getProducts(): Product[] {
    return this.products;
  }

  /**
   * Get loaded subscriptions
   */
  getSubscriptions(): ProductSubscription[] {
    return this.subscriptions;
  }

  /**
   * Get product by plan type
   */
  getProductByPlan(planType: PlanType): Product | ProductSubscription | null {
    const productId = getProductIdForPlan(planType);
    
    // Check products first (use 'id' property)
    const product = this.products.find(p => p.id === productId);
    if (product) return product;
    
    // Check subscriptions (use 'id' property)
    const subscription = this.subscriptions.find(s => s.id === productId);
    return subscription || null;
  }

  /**
   * Setup purchase listeners
   */
  private setupPurchaseListeners(): void {
    // Listen for purchase updates
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log('[IAP] Purchase updated:', purchase);
        
        // Verify purchase with your backend here
        // await this.verifyPurchaseWithBackend(purchase);
        
        // Finish the transaction
        try {
          await finishTransaction({ purchase, isConsumable: false });
          console.log('[IAP] Transaction finished successfully');
        } catch (error) {
          console.error('[IAP] Error finishing transaction:', error);
        }
      }
    );

    // Listen for purchase errors
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: RNIAPPurchaseError) => {
        console.error('[IAP] Purchase error:', error);
        this.handlePurchaseError(error);
      }
    );
  }

  /**
   * Handle purchase errors
   */
  private handlePurchaseError(error: RNIAPPurchaseError): void {
    const errorCode = error.code as string;
    let message = 'An error occurred during purchase';

    if (errorCode === 'E_USER_CANCELLED') {
      message = 'Purchase was cancelled';
    } else if (errorCode === 'E_ITEM_UNAVAILABLE') {
      message = 'This item is not available for purchase';
    } else if (errorCode === 'E_NETWORK_ERROR') {
      message = 'Network error. Please check your connection';
    } else if (errorCode === 'E_ALREADY_OWNED') {
      message = 'You already own this subscription';
    } else {
      message = error.message || 'Purchase failed';
    }

    Alert.alert('Purchase Error', message);
  }

  /**
   * Purchase a plan
   */
  async purchasePlan(planType: PlanType): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: 'Failed to initialize payment system',
          };
        }
      }

      const productId = getProductIdForPlan(planType);
      console.log(`[IAP] Purchasing plan: ${planType} (${productId})`);

      // Development mode - simulate successful purchase
      if (IAP_CONFIG.developmentMode) {
        console.log('[IAP] 🔧 Development mode - simulating purchase');
        // Simulate a delay
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
        
        const simulatedPurchase = {
          productId,
          transactionId: `dev_${Date.now()}`,
          transactionDate: Date.now(),
          transactionReceipt: 'development_mode_receipt',
        };

        // Save purchase to database
        await this.savePurchaseToDatabase(simulatedPurchase, planType);
        
        return {
          success: true,
          purchase: simulatedPurchase as any,
        };
      }

      // Show platform-specific payment method
      this.showPaymentMethodInfo();

      // Request purchase with platform-specific parameters
      const purchaseResult = await requestPurchase({
        request: Platform.OS === 'ios' 
          ? { ios: { sku: productId } }
          : { android: { skus: [productId] } },
        type: 'in-app', // or 'subs' for subscriptions
      });

      // Handle the result which can be Purchase, Purchase[], or null
      const purchase = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;

      console.log('[IAP] Purchase successful:', purchase);

      // Save purchase to database for tracking
      if (purchase) {
        await this.savePurchaseToDatabase(purchase, planType);
      }

      return {
        success: true,
        purchase: purchase ?? undefined,
      };
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      // Don't show error alert if user cancelled
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: PurchaseError.USER_CANCELLED,
        };
      }

      return {
        success: false,
        error: this.mapErrorCode(error.code),
      };
    }
  }

  /**
   * Show platform-specific payment method info
   */
  private showPaymentMethodInfo(): void {
    const paymentMethod = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';
    console.log(`[IAP] Using ${paymentMethod} for payment`);
  }

  /**
   * Map error codes to PurchaseError enum
   */
  private mapErrorCode(code: string): string {
    switch (code) {
      case 'E_USER_CANCELLED':
        return PurchaseError.USER_CANCELLED;
      case 'E_ITEM_UNAVAILABLE':
        return PurchaseError.NOT_AVAILABLE;
      case 'E_NETWORK_ERROR':
        return PurchaseError.NETWORK_ERROR;
      case 'E_ALREADY_OWNED':
        return PurchaseError.ALREADY_OWNED;
      default:
        return PurchaseError.UNKNOWN_ERROR;
    }
  }

  /**
   * Get platform name for display
   */
  getPlatformPaymentMethod(): string {
    return Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';
  }

  /**
   * Check if platform is iOS
   */
  isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Check if platform is Android
   */
  isAndroid(): boolean {
    return Platform.OS === 'android';
  }

  /**
   * Restore purchases (for iOS)
   */
  async restorePurchases(): Promise<Purchase[]> {
    try {
      console.log('[IAP] Restoring purchases...');
      // Implementation depends on your needs
      // You can use getAvailablePurchases() from react-native-iap
      return [];
    } catch (error) {
      console.error('[IAP] Error restoring purchases:', error);
      return [];
    }
  }

  /**
   * Save purchase to Firestore for admin tracking
   */
  private async savePurchaseToDatabase(purchase: any, planType: PlanType): Promise<void> {
    try {
      // Try to get user from Firebase Auth
      let user = auth().currentUser;
      let userId: string | undefined = user?.uid;
      let userEmail: string | undefined = user?.email || undefined;

      // Fallback to AsyncStorage if Firebase auth is not available
      if (!userId) {
        console.log('[IAP] No Firebase user, checking AsyncStorage...');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserEmail = await AsyncStorage.getItem('userEmail');
        userId = storedUserId || undefined;
        userEmail = storedUserEmail || undefined;
      }

      if (!userId) {
        console.log('[IAP] ⚠️ No user ID found (neither Firebase nor AsyncStorage), skipping database save');
        return;
      }

      console.log('[IAP] 💾 Saving purchase to Firestore...');
      console.log('[IAP] User ID:', userId);
      console.log('[IAP] User Email:', userEmail);
      console.log('[IAP] Plan Type:', planType);

      const transactionId = purchase.transactionId || `dev_${Date.now()}`;
      
      const purchaseData = {
        userId,
        email: userEmail || 'unknown',
        planType,
        productId: purchase.productId || getProductIdForPlan(planType),
        transactionId,
        platform: Platform.OS,
        purchaseDate: firestore.FieldValue.serverTimestamp(),
        status: 'active',
        isDevelopmentMode: IAP_CONFIG.developmentMode,
        receipt: purchase.transactionReceipt || 'development_mode',
        verifiedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Save to purchases collection
      console.log('[IAP] Saving to purchases collection...');
      await firestore()
        .collection('purchases')
        .doc(transactionId)
        .set(purchaseData);
      console.log('[IAP] ✅ Purchase document saved');

      // Update user's subscription status (use set with merge to create if doesn't exist)
      console.log('[IAP] Updating user subscription status...');
      await firestore()
        .collection('users')
        .doc(userId)
        .set({
          subscriptionPlan: planType,
          subscriptionStatus: 'active',
          lastPurchaseDate: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      console.log('[IAP] ✅ User subscription status updated');

      console.log('[IAP] ✅ Purchase saved to database successfully');
    } catch (error: any) {
      console.error('[IAP] ❌ Error saving purchase to database:', error);
      console.error('[IAP] Error details:', error.message);
      // Don't throw error - purchase was successful even if save failed
    }
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }

      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      await endConnection();
      this.isInitialized = false;
      console.log('[IAP] Disconnected successfully');
    } catch (error) {
      console.error('[IAP] Error disconnecting:', error);
    }
  }
}

// Export singleton instance
export const iapService = new IAPService();
