import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * useIsPremium()
 *
 * Single source of truth for a user's subscription status.
 * Reads subscription_status from Firestore in real-time.
 *
 * Returns:
 *   isPremium {boolean} — true when subscription_status === 'premium'
 *   loading   {boolean} — true while the initial fetch is in progress
 *   expiresAt {Date|null} — expiry date if premium, else null
 */
const useIsPremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPremium(data.subscription_status === 'premium');

          // subscription_expires_at is stored as a Firestore Timestamp
          if (data.subscription_expires_at) {
            setExpiresAt(data.subscription_expires_at.toDate());
          } else {
            setExpiresAt(null);
          }
        } else {
          setIsPremium(false);
          setExpiresAt(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('useIsPremium: Firestore snapshot error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { isPremium, expiresAt, loading };
};

export default useIsPremium;
