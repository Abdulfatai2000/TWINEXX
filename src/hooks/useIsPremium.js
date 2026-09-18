import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { authAPI } from '../utils/api';
import { UserProfileService } from '../services';
import {
  DEV_SIMULATE_PREMIUM,
  isDevelopmentSubscriptionMode,
  isLocalMode,
} from '../config/dev';

const useIsPremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsPremium(false);
      setExpiresAt(null);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        if (isLocalMode() || isDevelopmentSubscriptionMode()) {
          const profile = (await UserProfileService.getProfile(userId)) || {};
          const status = (
            profile.subscriptionStatus ||
            (DEV_SIMULATE_PREMIUM ? 'premium' : 'free')
          )?.toLowerCase();
          const localIsPremium = status === 'premium' || DEV_SIMULATE_PREMIUM;

          setIsPremium(localIsPremium);
          setExpiresAt(
            profile.subscriptionExpiresAt
              ? new Date(profile.subscriptionExpiresAt)
              : null
          );
          return;
        }

        const res = await authAPI.me();
        const data = res.data;
        setIsPremium(data.subscription_status === 'premium');
        if (data.subscription_expires_at) {
          setExpiresAt(new Date(data.subscription_expires_at));
        } else {
          setExpiresAt(null);
        }
      } catch (error) {
        console.error('useIsPremium: API error:', error);
        setIsPremium(false);
        setExpiresAt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [isSignedIn, userId]);

  return { isPremium, expiresAt, loading };
};

export default useIsPremium;