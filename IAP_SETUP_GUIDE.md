# In-App Purchase Setup Guide

This guide will help you configure in-app purchases for both iOS (Apple Pay) and Android (Google Pay) platforms.

## Overview

The app now includes a professional in-app purchase implementation that:
- ✅ Automatically detects device platform (iOS/Android)
- ✅ Shows Apple Pay for iOS devices
- ✅ Shows Google Pay for Android devices
- ✅ Handles purchase flow with proper error handling
- ✅ Includes loading states and user feedback
- ✅ Supports both subscriptions and one-time purchases

## Files Created/Modified

### New Files
1. **`src/services/iap.service.ts`** - Core IAP service with platform detection
2. **`src/types/iap.ts`** - TypeScript types for IAP
3. **`src/config/iap.config.ts`** - Product IDs configuration

### Modified Files
1. **`src/screens/SubscriptionPlanScreen.tsx`** - Integrated IAP functionality
2. **`package.json`** - Added react-native-iap dependency

## Setup Instructions

### 1. Configure Product IDs

Edit `src/config/iap.config.ts` and replace the placeholder product IDs with your actual IDs:

```typescript
// iOS Product IDs (from App Store Connect)
const IOS_PRODUCT_IDS = {
  basic: 'com.mailrecap.basic.monthly',      // Replace with your iOS product ID
  unlimited: 'com.mailrecap.unlimited.monthly', // Replace with your iOS product ID
};

// Android Product IDs (from Google Play Console)
const ANDROID_PRODUCT_IDS = {
  basic: 'mailrecap_basic_monthly',          // Replace with your Android product ID
  unlimited: 'mailrecap_unlimited_monthly',  // Replace with your Android product ID
};
```

### 2. iOS Setup (App Store Connect)

#### A. Create In-App Purchase Products
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **Features** → **In-App Purchases**
4. Click **+** to create a new in-app purchase
5. Choose type:
   - **Auto-Renewable Subscription** (recommended for recurring plans)
   - **Non-Consumable** (for one-time purchases)
6. Fill in the details:
   - **Product ID**: Must match the ID in `IOS_PRODUCT_IDS`
   - **Reference Name**: Descriptive name (e.g., "Basic Monthly Plan")
   - **Price**: Set your price tier
   - **Localization**: Add at least one language

#### B. Configure Capabilities in Xcode
1. Open `ios/mailrecap.xcworkspace` in Xcode
2. Select your project target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **In-App Purchase**

#### C. Link the Library
```bash
cd ios
pod install
cd ..
```

### 3. Android Setup (Google Play Console)

#### A. Create In-App Products
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Monetize** → **Products** → **In-app products** or **Subscriptions**
4. Click **Create product** or **Create subscription**
5. Fill in the details:
   - **Product ID**: Must match the ID in `ANDROID_PRODUCT_IDS`
   - **Name**: Display name
   - **Description**: Product description
   - **Price**: Set your price
6. Click **Activate** to make it available

#### B. Configure Permissions
Add the billing permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

#### C. Link the Library
The library should auto-link, but if you encounter issues:

```bash
npx react-native link react-native-iap
```

### 4. Testing

#### iOS Testing
1. **Create a Sandbox Tester Account**:
   - Go to App Store Connect → **Users and Access** → **Sandbox Testers**
   - Create a test account with a unique email
   
2. **Test on Device**:
   - Sign out of your real Apple ID in Settings → App Store
   - Run the app on a physical device (not simulator)
   - When prompted for Apple ID, use your sandbox tester account
   - Complete the purchase flow

#### Android Testing
1. **Add License Testers**:
   - Go to Google Play Console → **Setup** → **License testing**
   - Add test Gmail accounts
   
2. **Test with Internal Testing Track**:
   - Upload your app to Internal Testing track
   - Add testers
   - Install the app from Play Store
   - Test purchases (they will be free for testers)

### 5. Production Checklist

Before releasing to production:

- [ ] Replace all product IDs with real ones
- [ ] Set `enableSandbox: false` in `src/config/iap.config.ts`
- [ ] Test on real devices with test accounts
- [ ] Verify purchase receipts are validated on your backend
- [ ] Implement receipt verification (see Security section below)
- [ ] Test restore purchases functionality
- [ ] Add terms of service and privacy policy links
- [ ] Comply with platform-specific subscription guidelines

### 6. Security Best Practices

#### Backend Receipt Verification (Recommended)

You should verify purchases on your backend to prevent fraud:

1. **iOS**: Verify receipts with Apple's servers
   - Use the `transactionReceipt` from the purchase
   - Send to Apple's verification endpoint
   - Validate the response

2. **Android**: Verify purchases with Google Play
   - Use the `purchaseToken` from the purchase
   - Verify with Google Play Developer API
   - Check signature and purchase state

Example implementation location in `iap.service.ts`:
```typescript
// Line 106-107 in iap.service.ts
// Verify purchase with your backend here
// await this.verifyPurchaseWithBackend(purchase);
```

### 7. Platform-Specific Payment Methods

The app automatically shows the correct payment method:

- **iOS**: Apple Pay (uses Apple ID payment methods)
- **Android**: Google Pay (uses Google Play payment methods)

This is handled automatically by the platform's native payment UI. The app displays which payment method will be used before the purchase.

### 8. Troubleshooting

#### Common Issues

**"No products found"**
- Verify product IDs match exactly in both the config and store consoles
- Ensure products are active/approved in the store
- Check that you're using the correct bundle ID/package name
- Wait 1-2 hours after creating products for them to propagate

**"Purchase failed"**
- Check device has a valid payment method configured
- Verify billing permission is added (Android)
- Ensure In-App Purchase capability is enabled (iOS)
- Check console logs for specific error messages

**TypeScript errors**
- The service uses `any` types in some places due to react-native-iap API variations
- This is intentional for compatibility across different versions

### 9. Additional Features

The IAP service includes methods for:

- **Restore Purchases**: `iapService.restorePurchases()`
- **Get Products**: `iapService.getProducts()`
- **Platform Detection**: `iapService.isIOS()`, `iapService.isAndroid()`
- **Payment Method**: `iapService.getPlatformPaymentMethod()`

### 10. Support & Documentation

- [react-native-iap Documentation](https://github.com/dooboolab-community/react-native-iap)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing Guide](https://developer.android.com/google/play/billing)

## Implementation Details

### How It Works

1. **Initialization**: When the subscription screen loads, the IAP service initializes and fetches available products
2. **Platform Detection**: The service automatically detects iOS/Android and shows the appropriate payment method
3. **Purchase Flow**: When user clicks Continue:
   - Confirmation dialog shows with platform-specific payment method
   - Native payment UI appears (Apple Pay or Google Pay)
   - Purchase is processed through the platform
   - Success/error feedback is shown to the user
4. **Transaction Completion**: Purchases are automatically finished after successful completion

### Error Handling

The implementation handles these error cases:
- User cancellation (no error shown)
- Network errors
- Invalid payment methods
- Already owned subscriptions
- Unavailable products
- Unknown errors

All errors are logged to console for debugging.

---

**Need Help?** Check the console logs for detailed error messages and refer to the react-native-iap documentation for advanced use cases.
