import { useState, useEffect, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { useAuth } from '@clerk/clerk-expo';
import api, { authAPI } from '../utils/api';
import {
  REVENUECAT_API_KEY,
  PREMIUM_ENTITLEMENT_ID,
} from '../config/revenuecat';

const useRevenueCat = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useAuth();

  // ── Sync RevenueCat → MongoDB via API ────────────────────────────────────
  const syncToMongoDB = useCallback(async (info) => {
    try {
      const isPremium =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !== undefined;

      const expiresDate =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID]
          ?.expirationDate ?? null;

      await api.patch(
        '/api/users/me',
        {
          subscription_status: isPremium ? 'premium' : 'free',
          subscription_expires_at: expiresDate,
        }
      );
    } catch (error) {
      console.error('useRevenueCat: MongoDB sync error:', error);
    }
  }, []);

  // ── SDK init + listener ──────────────────────────────────────────────────
  useEffect(() => {
    let listenerRef = null;

    const init = async () => {
      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        if (isSignedIn) {
          try {
            const meRes = await authAPI.me();
            if (meRes.data?.id) {
              await Purchases.logIn(meRes.data.id);
            }
          } catch (e) {
            console.warn('useRevenueCat: Could not logIn to RevenueCat', e);
          }
        }

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        await syncToMongoDB(info);
      } catch (error) {
        console.error('useRevenueCat: Init error:', error);
      } finally {
        setLoading(false);
      }

      listenerRef = Purchases.addCustomerInfoUpdateListener(async (info) => {
        setCustomerInfo(info);
        await syncToMongoDB(info);
      });
    };

    init();

    return () => {
      if (listenerRef) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef);
      }
    };
  }, [syncToMongoDB, isSignedIn]);

  // ── Purchase ─────────────────────────────────────────────────────────────
  const purchasePremium = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings?.current?.availablePackages?.[0];

      if (!pkg) {
        throw new Error(
          'No packages available. Make sure your RevenueCat offering is configured.'
        );
      }

      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      await syncToMongoDB(updatedInfo);
      return { success: true };
    } catch (error) {
      if (error.userCancelled) {
        return { success: false, cancelled: true };
      }
      console.error('useRevenueCat: Purchase error:', error);
      return { success: false, error: error.message };
    }
  }, [syncToMongoDB]);

  // ── Restore ──────────────────────────────────────────────────────────────
  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      await syncToMongoDB(info);

      const isPremium =
        info?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !== undefined;
      return { success: true, isPremium };
    } catch (error) {
      console.error('useRevenueCat: Restore error:', error);
      return { success: false, error: error.message };
    }
  }, [syncToMongoDB]);

  return { customerInfo, loading, purchasePremium, restorePurchases };
};

export default useRevenueCat;