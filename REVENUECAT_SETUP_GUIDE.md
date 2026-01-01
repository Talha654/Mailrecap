# RevenueCat & Store Setup Guide

This guide outlines exactly which plans you need to create in Apple and Google consoles to match the app implementation.

## 1. Plan Identifiers to Create
You need to create **4 subscription products** in both the Apple and Google consoles. Use these IDs (or include them in your ID) for automatic mapping:

| Plan Name | Frequency | Recommended Product ID |
| :--- | :--- | :--- |
| **Essentials Monthly** | Monthly | `essentials_monthly` |
| **Essentials Yearly** | Yearly | `essentials_yearly` |
| **Plus Monthly** | Monthly | `plus_monthly` |
| **Plus Yearly** | Yearly | `plus_yearly` |

---

## 2. Apple App Store Setup
1. Log in to [App Store Connect](https://appstoreconnect.apple.com/).
2. Go to **My Apps** > Select **MailRecap**.
3. In the sidebar, under **Features**, select **Subscriptions**.
4. Create a **Subscription Group** (e.g., "MailRecap Subscriptions").
5. Inside the group, click **Create** (+) to add the 4 subscriptions:
   - Select **Auto-Renewable Subscription**.
   - Use the Product IDs from the table above.
   - Set the correct **Duration** (1 month or 1 year).
   - Set the matching **Price** ($3.99, $39.00, etc.).
6. Click **Save** and ensures they are in the "Ready to Submit" state.

---

## 3. Google Play Store Setup
1. Log in to [Google Play Console](https://play.google.com/console/).
2. Select your app **MailRecap**.
3. In the sidebar, under **Monetize**, go to **Products** > **Subscriptions**.
4. Click **Create subscription**.
5. Use the Product IDs from the table above (e.g., `plus_yearly`).
6. Within each subscription:
   - Click **Add base plan**.
   - Set as **Auto-renewing**.
   - Select the **Billing period** (Monthly or Yearly).
   - Set the **Price** for each region.
7. Click **Activate** for each base plan.

---

## 4. RevenueCat Dashboard Integration
1. Go to your [RevenueCat Project](https://app.revenuecat.com/).
2. **Apps**: Ensure your iOS and Android apps are added and the API keys match `revenueCat.config.ts`.
3. **Entitlements**: Create one entitlement with ID `premium`.
4. **Offerings**: Create a default offering.
5. **Packages**: Inside the offering, create packages for each plan:
   - Create a package (e.g., `Monthly Essentials`).
   - Attach the corresponding Apple and Google products you just created.
   - **Crucial**: Ensure the RevenueCat **Package Identifier** matches the IDs in the table (e.g., `essentials_monthly`) OR ensure the internal mapping logic in `SubscriptionPlanScreen.tsx` can find them.

## 5. Verification
Once the products are "Ready to Submit" (Apple) and "Active" (Google), and linked in RevenueCat:
1. Re-run the app.
2. Go to the Subscription screen.
3. The prices should now update from placeholders (e.g., "$3.99") to the real prices from the stores.
