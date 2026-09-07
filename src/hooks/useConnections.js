import { useState, useEffect } from 'react';
import { connectionAPI } from '../utils/connectionsApi';

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

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await connectionAPI.list();
        setConnections(res.data);
      } catch (error) {
        console.error('useConnections: Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  return { connections, loading };
};

export default useConnections;