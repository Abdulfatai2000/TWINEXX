import { useState, useEffect, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  REVENUECAT_API_KEY,
  PREMIUM_ENTITLEMENT_ID,
} from '../config/revenuecat';

/**
 * useRevenueCat()
 *
 * Initialises the RevenueCat SDK, listens for customer info updates,
 * and syncs subscription state back to Firestore whenever it changes.
 *
 * Call this hook ONCE at the top of the app (inside SubscriptionContext).
 *
 * Returns:
 *   customerInfo      {object|null}  — raw RevenueCat CustomerInfo
 *   loading           {boolean}
 *   purchasePremium   {Function}     — triggers the native purchase sheet
 *   restorePurchases  {Function}     — restores previous purchases
 */
const useRevenueCat = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Sync RevenueCat → Firestore ──────────────────────────────────────────
  const syncToFirestore = useCallback(async (info) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const isPremium =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !== undefined;

      const expiresDate =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID]
          ?.expirationDate ?? null;

      await updateDoc(doc(db, 'users', user.uid), {
        subscription_status: isPremium ? 'premium' : 'free',
        subscription_expires_at: expiresDate
          ? Timestamp.fromDate(new Date(expiresDate))
          : null,
      });
    } catch (error) {
      console.error('useRevenueCat: Firestore sync error:', error);
    }
  }, []);

  // ── SDK init + listener ──────────────────────────────────────────────────
  useEffect(() => {
    let listenerRef = null;

    const init = async () => {
      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        // Identify the user so their purchases are tied to their UID
        const user = auth.currentUser;
        if (user) {
          await Purchases.logIn(user.uid);
        }

        // Fetch initial customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        await syncToFirestore(info);
      } catch (error) {
        console.error('useRevenueCat: Init error:', error);
      } finally {
        setLoading(false);
      }

      // Listen for real-time updates (e.g., subscription renewal in background)
      listenerRef = Purchases.addCustomerInfoUpdateListener(async (info) => {
        setCustomerInfo(info);
        await syncToFirestore(info);
      });
    };

    init();

    return () => {
      if (listenerRef) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef);
      }
    };
  }, [syncToFirestore]);

  // ── Purchase ─────────────────────────────────────────────────────────────
  const purchasePremium = useCallback(async () => {
    try {
      // Fetch the default offering from RevenueCat
      const offerings = await Purchases.getOfferings();
      const pkg = offerings?.current?.availablePackages?.[0];

      if (!pkg) {
        throw new Error(
          'No packages available. Make sure your RevenueCat offering is configured.'
        );
      }

      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      await syncToFirestore(updatedInfo);
      return { success: true };
    } catch (error) {
      // PurchaseCancelledError has code 1 — user cancelled intentionally, not an error
      if (error.userCancelled) {
        return { success: false, cancelled: true };
      }
      console.error('useRevenueCat: Purchase error:', error);
      return { success: false, error: error.message };
    }
  }, [syncToFirestore]);

  // ── Restore ──────────────────────────────────────────────────────────────
  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      await syncToFirestore(info);

      const isPremium =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !== undefined;
      return { success: true, isPremium };
    } catch (error) {
      console.error('useRevenueCat: Restore error:', error);
      return { success: false, error: error.message };
    }
  }, [syncToFirestore]);

  return { customerInfo, loading, purchasePremium, restorePurchases };
};

export default useRevenueCat;
