import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * useConnections()
 *
 * Returns all ACTIVE connections for the current user, enriched with
 * the other person's name and the current user's role in each relationship.
 *
 * Firestore doesn't support OR queries across different fields without a
 * composite index, so we run two separate real-time listeners and merge
 * the results client-side.
 *
 * Returns:
 *   connections  {Array}   — enriched connection objects
 *   loading      {boolean}
 *
 * Each connection object:
 *   {
 *     id, requester_id, target_id, mentor_id, student_id,
 *     status, created_at,
 *     otherUserName: string,
 *     myRole: 'mentor' | 'student',
 *   }
 */
const useConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Map keyed by connection doc ID to avoid duplicates during merge
    let asRequester = {};
    let asTarget = {};
    let mounted = true;

    const merge = async (requesterMap, targetMap) => {
      const combined = { ...requesterMap, ...targetMap };
      const raw = Object.values(combined);

      // Enrich with other user's name
      const enriched = await Promise.all(
        raw.map(async (conn) => {
          const otherUid =
            conn.requester_id === user.uid
              ? conn.target_id
              : conn.requester_id;

          let otherUserName = 'Unknown';
          try {
            const userSnap = await getDoc(doc(db, 'users', otherUid));
            if (userSnap.exists()) {
              otherUserName = userSnap.data().name || 'Unknown';
            }
          } catch (e) {
            console.error('useConnections: Failed to fetch user name', e);
          }

          const myRole = conn.mentor_id === user.uid ? 'mentor' : 'student';

          return { ...conn, otherUserName, myRole };
        })
      );

      if (mounted) {
        setConnections(enriched);
        setLoading(false);
      }
    };

    // Query 1: current user is the requester
    const q1 = query(
      collection(db, 'connections'),
      where('requester_id', '==', user.uid),
      where('status', '==', 'active')
    );

    // Query 2: current user is the target
    const q2 = query(
      collection(db, 'connections'),
      where('target_id', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      asRequester = {};
      snap.forEach((d) => {
        asRequester[d.id] = { id: d.id, ...d.data() };
      });
      merge(asRequester, asTarget);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      asTarget = {};
      snap.forEach((d) => {
        asTarget[d.id] = { id: d.id, ...d.data() };
      });
      merge(asRequester, asTarget);
    });

    return () => {
      mounted = false;
      unsub1();
      unsub2();
    };
  }, []);

  return { connections, loading };
};

export default useConnections;
