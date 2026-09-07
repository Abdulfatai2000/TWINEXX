import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { UserCheck, UserX } from 'lucide-react-native';
import { auth, db } from '../config/firebase';

const IncomingScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null); // tracks which card is being actioned

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'connections'),
      where('target_id', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Enrich with requester name
        const enriched = await Promise.all(
          raw.map(async (conn) => {
            let requesterName = 'Unknown';
            try {
              const userSnap = await getDoc(doc(db, 'users', conn.requester_id));
              if (userSnap.exists()) {
                requesterName = userSnap.data().name || 'Unknown';
              }
            } catch (e) {
              console.error('IncomingScreen: Failed to fetch requester name', e);
            }
            return { ...conn, requesterName };
          })
        );

        setRequests(enriched);
        setLoading(false);
      },
      (error) => {
        console.error('IncomingScreen: snapshot error', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (connectionId) => {
    setActioningId(connectionId);
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: 'active',
      });
      // Listener will automatically remove it from the pending list
    } catch (error) {
      console.error('IncomingScreen: approve error', error);
      Alert.alert('Error', 'Could not approve the request. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (connectionId, requesterName) => {
    Alert.alert(
      'Decline Request',
      `Decline connection request from ${requesterName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setActioningId(connectionId);
            try {
              // Keep the document but mark it declined (preserves history)
              await updateDoc(doc(db, 'connections', connectionId), {
                status: 'declined',
              });
            } catch (error) {
              console.error('IncomingScreen: decline error', error);
              Alert.alert('Error', 'Could not decline the request. Please try again.');
            } finally {
              setActioningId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Incoming Requests</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Requests</Text>
        {requests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{requests.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySubtitle}>
              When someone enters your PIN to connect, their request will appear
              here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isActioning = actioningId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.cardAvatar}>
                <Text style={styles.cardAvatarText}>
                  {item.requesterName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.requesterName}</Text>
                <Text style={styles.cardMeta}>
                  Wants you to be their accountability mentor
                </Text>
              </View>

              {isActioning ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve request from ${item.requesterName}`}
                  >
                    <UserCheck size={18} color="#FFFFFF" />
                    <Text style={styles.approveBtnText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(item.id, item.requesterName)}
                    accessibilityRole="button"
                    accessibilityLabel={`Decline request from ${item.requesterName}`}
                  >
                    <UserX size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Request card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default IncomingScreen;
