# How to Enable Real Google Pay / Apple Pay

## Why Payment UI Isn't Opening

**Current Setting:** `developmentMode: true` in `src/config/iap.config.ts`

**What This Means:**
- ✅ Purchases are simulated (no real payment UI)
- ✅ Good for testing UI/UX
- ❌ Google Pay/Apple Pay won't open
- ❌ No real payment processing

## To Enable Real Payments

### ⚠️ Prerequisites (REQUIRED)

Before disabling development mode, you MUST:

1. **Create products in App Store Connect** (for iOS/Apple Pay)
2. **Create products in Google Play Console** (for Android/Google Pay)
3. **Update product IDs** in the config file

**If you skip this, you'll get "Invalid product ID" errors!**

---

## Step-by-Step Setup

### For Android (Google Pay)

#### 1. Create Products in Google Play Console

1. **Go to Google Play Console**
   - Visit: https://play.google.com/console
   - Select your app

2. **Navigate to Subscriptions**
   - Click **Monetize** → **Subscriptions**
   - Click **Create subscription**

3. **Create Basic Plan**
   - Product ID: `mailrecap_basic_monthly`
   - Name: "Basic Plan"
   - Description: "Up to 10 letters per month"
   - Price: Set your price (e.g., $7/month)
   - Billing period: Monthly
   - Click **Save** → **Activate**

4. **Create Unlimited Plan**
   - Product ID: `mailrecap_unlimited_monthly`
   - Name: "Unlimited Plan"
   - Description: "Unlimited letters per month"
   - Price: Set your price (e.g., $14/month)
   - Billing period: Monthly
   - Click **Save** → **Activate**

5. **Wait for Activation**
   - Products may take 1-2 hours to become available

#### 2. Set Up License Testing

1. In Google Play Console, go to **Setup** → **License testing**
2. Add test Gmail accounts
3. These accounts can make test purchases for free

### For iOS (Apple Pay)

#### 1. Create Products in App Store Connect

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Select your app

2. **Navigate to In-App Purchases**
   - Click **Features** → **In-App Purchases**
   - Click **+** to create new

3. **Create Basic Plan**
   - Type: **Auto-Renewable Subscription**
   - Reference Name: "Basic Monthly Plan"
   - Product ID: `com.mailrecap.basic.monthly`
   - Subscription Group: Create new group "Subscription Plans"
   - Subscription Duration: 1 Month
   - Price: Set your price tier
   - Add localization (at least one language)
   - Click **Save**

4. **Create Unlimited Plan**
   - Type: **Auto-Renewable Subscription**
   - Reference Name: "Unlimited Monthly Plan"
   - Product ID: `com.mailrecap.unlimited.monthly`
   - Subscription Group: Same as above
   - Subscription Duration: 1 Month
   - Price: Set your price tier
   - Add localization
   - Click **Save**

5. **Submit for Review**
   - Products need Apple approval before testing
   - Or use sandbox mode for testing

#### 2. Add In-App Purchase Capability in Xcode

1. Open `ios/mailrecap.xcworkspace` in Xcode
2. Select your project target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **In-App Purchase**

#### 3. Set Up Sandbox Testers

1. In App Store Connect, go to **Users and Access**
2. Click **Sandbox Testers**
3. Click **+** to add tester
4. Create test Apple ID (use unique email)
5. Use this account for testing

---

## Update Configuration

### Step 1: Verify Product IDs Match

Make sure the product IDs in your config **exactly match** what you created:

**Current config** (`src/config/iap.config.ts`):
```typescript
const IOS_PRODUCT_IDS = {
  basic: 'com.mailrecap.basic.monthly',      // ← Must match App Store Connect
  unlimited: 'com.mailrecap.unlimited.monthly',
};

const ANDROID_PRODUCT_IDS = {
  basic: 'mailrecap_basic_monthly',          // ← Must match Google Play Console
  unlimited: 'mailrecap_unlimited_monthly',
};
```

### Step 2: Disable Development Mode

Edit `src/config/iap.config.ts`:

```typescript
export const IAP_CONFIG = {
  enableSandbox: __DEV__,
  autoFinishTransactions: false,
  purchaseTimeout: 60000,
  
  developmentMode: false,  // ← Change from true to false
};
```

---

## Testing Real Payments

### Android Testing

1. **Build and install app**
   ```bash
   npm run android
   ```

2. **Sign in with test account**
   - Use Gmail account added to license testing

3. **Make a purchase**
   - Select a plan
   - Click Continue
   - **Google Pay sheet will open** 🎉
   - Complete test purchase (free for test accounts)

### iOS Testing

1. **Sign out of real Apple ID**
   - On device: Settings → App Store → Sign Out

2. **Build and install app**
   ```bash
   npm run ios --device
   ```
   (Must use physical device, not simulator)

3. **Make a purchase**
   - Select a plan
   - Click Continue
   - **Apple Pay sheet will open** 🎉
   - Sign in with sandbox tester account
   - Complete test purchase

---

## What You'll See

### Before (Development Mode):
```
[IAP] 🔧 Development mode - simulating purchase
[No payment UI opens]
[Purchase completes after 1 second]
```

### After (Real Mode):
```
[IAP] Initializing connection...
[IAP] Loading products...
[IAP] Loaded products: 2
[IAP] Purchasing plan: unlimited
[Native payment UI opens - Google Pay or Apple Pay]
[User completes payment]
[IAP] Purchase successful
```

---

## Troubleshooting

### "Invalid product ID" Error

**Cause:** Products not created or IDs don't match

**Solution:**
1. Verify products exist in store consoles
2. Check product IDs match exactly
3. Wait 1-2 hours after creating products
4. Ensure products are activated

### "No products found"

**Cause:** Products not loaded or not available

**Solution:**
1. Check internet connection
2. Verify app bundle ID matches store
3. Check console logs for errors
4. Ensure products are active in store

### Google Pay doesn't open

**Cause:** 
- Development mode still enabled
- Invalid product IDs
- Not using test account

**Solution:**
1. Verify `developmentMode: false`
2. Check product IDs
3. Use license testing account

### Apple Pay doesn't open

**Cause:**
- Testing on simulator (not supported)
- Development mode enabled
- Products not approved

**Solution:**
1. Test on physical device
2. Verify `developmentMode: false`
3. Use sandbox tester account

---

## Quick Comparison

| Mode | Payment UI | Real Money | Setup Required |
|------|-----------|------------|----------------|
| **Development** | ❌ No | ❌ No | ✅ None |
| **Sandbox/Test** | ✅ Yes | ❌ No | ⚠️ Products + Test accounts |
| **Production** | ✅ Yes | ✅ Yes | ✅ Full setup |

---

## Recommendation

### For Now (Testing UI):
- Keep `developmentMode: true`
- Test UI flow without real payments
- Purchases still save to Firestore

### When Ready for Real Testing:
1. Create products in both stores
2. Set up test accounts
3. Update product IDs
4. Set `developmentMode: false`
5. Test on physical devices

### For Production:
1. Complete all setup steps
2. Get products approved
3. Set `developmentMode: false`
4. Deploy to users

---

## Summary

**To see Google Pay/Apple Pay:**

1. ✅ Create products in store consoles
2. ✅ Update product IDs in config
3. ✅ Set `developmentMode: false`
4. ✅ Test with sandbox/license testing accounts
5. ✅ Use physical device for iOS

**Current Status:**
- `developmentMode: true` → Simulated payments (no UI)
- `developmentMode: false` → Real payment UI opens

---

**Need help setting up products?** Follow the step-by-step guides above for your platform!
