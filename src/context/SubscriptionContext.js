import React, { createContext, useContext } from 'react';
import useRevenueCat from '../hooks/useRevenueCat';
import useIsPremium from '../hooks/useIsPremium';

/**
 * SubscriptionContext
 *
 * Provides subscription state and actions to the entire app.
 * Wrap your root navigator with <SubscriptionProvider>.
 *
 * Available via useSubscription():
 *   isPremium         {boolean}
 *   expiresAt         {Date|null}
 *   premiumLoading    {boolean}
 *   customerInfo      {object|null}
 *   rcLoading         {boolean}
 *   purchasePremium   {Function}
 *   restorePurchases  {Function}
 */

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  // RevenueCat SDK state + actions
  const {
    customerInfo,
    loading: rcLoading,
    purchasePremium,
    restorePurchases,
  } = useRevenueCat();

  // Firestore-backed isPremium (real-time, persists across sessions)
  const { isPremium, expiresAt, loading: premiumLoading } = useIsPremium();

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        expiresAt,
        premiumLoading,
        customerInfo,
        rcLoading,
        purchasePremium,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * useSubscription()
 * Convenience hook for consuming subscription context.
 */
export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return ctx;
};

export default SubscriptionContext;
