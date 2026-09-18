import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { connectionAPI } from '../utils/connectionsApi';
import { ConnectionService, registerLocalUser } from '../services';
import { isLocalMode, isDevelopmentSubscriptionMode } from '../config/dev';

/**
 * useConnections()
 *
 * Returns all ACTIVE connections for the current user, enriched with
 * the other person's name and the current user's role in each relationship.
 *
 * Returns:
 *   connections  {Array}   — enriched connection objects
 *   loading      {boolean}
 */
const useConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchConnections = async () => {
      if (!isSignedIn || !userId) {
        setConnections([]);
        setLoading(false);
        return;
      }

      try {
        if (isLocalMode() || isDevelopmentSubscriptionMode()) {
          const localConnections = await ConnectionService.getConnections(userId);
          setConnections(localConnections);
          return;
        }

        const res = await connectionAPI.list();
        setConnections(res.data);
      } catch (error) {
        console.error('useConnections: Error:', error);
        setConnections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [userId, isSignedIn]);

  return { connections, loading };
};

export default useConnections;