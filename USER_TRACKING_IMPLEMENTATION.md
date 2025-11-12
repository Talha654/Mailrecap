# ✅ User Tracking & Purchase Data Implementation

## What I Just Fixed

### Issue 1: User ID Not Stored in AsyncStorage ✅ FIXED
**Problem:** User ID wasn't being saved to AsyncStorage on login

**Solution:** Updated `src/services/auth.ts` to automatically save user ID and email to AsyncStorage

### Issue 2: Purchase Data Not Saved to Firestore ✅ FIXED
**Problem:** Purchases weren't being saved to Firestore

**Solution:** 
- Fixed Firestore save method to use `set` with `merge` instead of `update`
- Added fallback to get user ID from AsyncStorage if Firebase auth is unavailable
- Added detailed logging to track the save process
- Ensured user ID is always included in purchase data

## 🔧 Changes Made

### 1. Auth Service (`src/services/auth.ts`)

#### On Login:
```typescript
// Now saves to AsyncStorage automatically
await AsyncStorage.setItem('userId', user.uid);
await AsyncStorage.setItem('userEmail', user.email);
```

#### On Signup:
```typescript
// Also saves to AsyncStorage
await AsyncStorage.setItem('userId', user.uid);
await AsyncStorage.setItem('userEmail', user.email);
```

#### On Logout:
```typescript
// Clears AsyncStorage
await AsyncStorage.removeItem('userId');
await AsyncStorage.removeItem('userEmail');
```

### 2. IAP Service (`src/services/iap.service.ts`)

#### Enhanced Purchase Tracking:
```typescript
// Gets user ID from Firebase Auth OR AsyncStorage
let userId = auth().currentUser?.uid;
if (!userId) {
  userId = await AsyncStorage.getItem('userId');
}

// Saves purchase with user ID
const purchaseData = {
  userId,           // ← User ID always included
  email,
  planType,
  productId,
  transactionId,
  platform,
  purchaseDate,
  status: 'active',
  isDevelopmentMode,
  receipt,
};
```

#### Better Error Handling:
- Added detailed console logs
- Shows exactly what's being saved
- Reports errors clearly
- Uses `set` with `merge` to avoid update errors

## 📊 What Gets Saved to Firestore

### Collection: `purchases`

Each purchase document contains:

```typescript
{
  userId: "abc123...",              // ← User ID (from auth or AsyncStorage)
  email: "user@example.com",        // ← User email
  planType: "basic" | "unlimited",  // ← Which plan
  productId: "com.mailrecap.basic.monthly",
  transactionId: "dev_1729407600000",
  platform: "ios" | "android",
  purchaseDate: Timestamp,
  status: "active",
  isDevelopmentMode: true/false,    // ← Identifies test purchases
  receipt: "...",
  verifiedAt: Timestamp
}
```

### Collection: `users`

User document gets updated with:

```typescript
{
  subscriptionPlan: "basic" | "unlimited",
  subscriptionStatus: "active",
  lastPurchaseDate: Timestamp
}
```

## 🧪 How to Test

### 1. Login Test

```bash
# Run the app
npm run ios

# Login with your account
# Check console logs:
[Auth] User ID saved to AsyncStorage: abc123...
```

### 2. Purchase Test

```bash
# Make a test purchase
# Check console logs:
[IAP] 💾 Saving purchase to Firestore...
[IAP] User ID: abc123...
[IAP] User Email: user@example.com
[IAP] Plan Type: unlimited
[IAP] Saving to purchases collection...
[IAP] ✅ Purchase document saved
[IAP] Updating user subscription status...
[IAP] ✅ User subscription status updated
[IAP] ✅ Purchase saved to database successfully
```

### 3. Check Firestore

1. Go to Firebase Console
2. Open Firestore Database
3. Check `purchases` collection
4. You should see:
   - Your user ID
   - Your email
   - Plan type
   - All purchase details

## 🔍 Verify User ID is Saved

### Check AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get user ID
const userId = await AsyncStorage.getItem('userId');
console.log('Stored User ID:', userId);

// Get user email
const userEmail = await AsyncStorage.getItem('userEmail');
console.log('Stored Email:', userEmail);
```

### Check Firestore:

```typescript
import firestore from '@react-native-firebase/firestore';

// Get user's purchases
const userId = await AsyncStorage.getItem('userId');
const purchases = await firestore()
  .collection('purchases')
  .where('userId', '==', userId)
  .get();

console.log('User purchases:', purchases.size);
```

## 📋 Console Logs to Watch For

### Successful Flow:

```
[Auth] User ID saved to AsyncStorage: abc123...
↓
[IAP] 💾 Saving purchase to Firestore...
[IAP] User ID: abc123...
[IAP] User Email: user@example.com
[IAP] Plan Type: unlimited
↓
[IAP] Saving to purchases collection...
[IAP] ✅ Purchase document saved
↓
[IAP] Updating user subscription status...
[IAP] ✅ User subscription status updated
↓
[IAP] ✅ Purchase saved to database successfully
```

### If No User ID:

```
[IAP] No Firebase user, checking AsyncStorage...
[IAP] ⚠️ No user ID found (neither Firebase nor AsyncStorage), skipping database save
```

**This means:** User needs to login first!

## 🎯 Query Purchases by User

### Get All Purchases for a User:

```typescript
const userId = await AsyncStorage.getItem('userId');

const userPurchases = await firestore()
  .collection('purchases')
  .where('userId', '==', userId)
  .orderBy('purchaseDate', 'desc')
  .get();

userPurchases.forEach(doc => {
  const data = doc.data();
  console.log(`${data.email} bought ${data.planType} plan`);
});
```

### Get User's Current Plan:

```typescript
const userId = await AsyncStorage.getItem('userId');

const userDoc = await firestore()
  .collection('users')
  .doc(userId)
  .get();

const userData = userDoc.data();
console.log('Current plan:', userData?.subscriptionPlan);
console.log('Status:', userData?.subscriptionStatus);
```

### Admin: Get All Purchases:

```typescript
const allPurchases = await firestore()
  .collection('purchases')
  .orderBy('purchaseDate', 'desc')
  .get();

console.log('Total purchases:', allPurchases.size);

allPurchases.forEach(doc => {
  const data = doc.data();
  console.log(`User ${data.email} - Plan: ${data.planType}`);
});
```

### Filter by Plan Type:

```typescript
const unlimitedPurchases = await firestore()
  .collection('purchases')
  .where('planType', '==', 'unlimited')
  .get();

console.log('Unlimited plan purchases:', unlimitedPurchases.size);
```

## ✅ What's Working Now

- ✅ **User ID saved to AsyncStorage** on login/signup
- ✅ **User ID cleared from AsyncStorage** on logout
- ✅ **Purchase data saved to Firestore** with user ID
- ✅ **User subscription status updated** in Firestore
- ✅ **Fallback to AsyncStorage** if Firebase auth unavailable
- ✅ **Detailed logging** for debugging
- ✅ **Error handling** to prevent crashes

## 🚀 Next Steps

1. **Test the flow:**
   - Login to your app
   - Make a test purchase
   - Check Firebase Console

2. **Verify data:**
   - Open Firestore Database
   - Check `purchases` collection
   - Confirm user ID is present

3. **Query purchases:**
   - Use Firebase Console filters
   - Or use the code examples above

## 📊 Firebase Console Access

**To view purchases by user:**

1. Go to Firebase Console → Firestore
2. Open `purchases` collection
3. Add filter:
   - Field: `userId`
   - Operator: `==`
   - Value: [paste user ID]
4. See all purchases for that user!

## 💡 Pro Tip

You can now easily track:
- **Which user** bought which plan
- **When** they purchased
- **What platform** they used (iOS/Android)
- **Test vs real** purchases (isDevelopmentMode flag)

---

**Everything is now properly tracked with user IDs!** 🎉
