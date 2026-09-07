import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import api, { authAPI } from '../utils/api';

const useIsPremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [isSignedIn]);

  return { isPremium, expiresAt, loading };
};

export default useIsPremium;