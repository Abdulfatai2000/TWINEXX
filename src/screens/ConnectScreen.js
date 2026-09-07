import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import { auth, db } from '../config/firebase';
import { useSubscription } from '../context/SubscriptionContext';

// ─────────────────────────────────────────────────────────────────────────────
// TEMP FLAG — Phase 3 RevenueCat sandbox not yet set up.
// Set to `false` once you can test real subscriptions (see Phase 3 setup notes).
// When false: BOTH requester AND target must be premium to connect.
// ─────────────────────────────────────────────────────────────────────────────
const SKIP_PREMIUM_CHECK_TEMP = true;

const ConnectScreen = ({ navigation }) => {
  const { isPremium } = useSubscription();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    const trimmedPin = pin.trim().toUpperCase();
    if (!trimmedPin) {
      setError('Please enter a PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUser = auth.currentUser;

      // ── Step 1: Look up the PIN in the users collection ──────────────────
      const usersRef = collection(db, 'users');
      const pinQuery = query(usersRef, where('pin', '==', trimmedPin));
      const pinSnap = await getDocs(pinQuery);

      if (pinSnap.empty) {
        setError('No user found with that PIN. Check the PIN and try again.');
        return;
      }

      const targetDoc = pinSnap.docs[0];
      const targetUser = { id: targetDoc.id, ...targetDoc.data() };

      // ── Step 2: Prevent self-connection ──────────────────────────────────
      if (targetUser.id === currentUser.uid) {
        setError("That's your own PIN! Enter a partner's PIN to connect.");
        return;
      }

      // ── Step 3: Premium gate ──────────────────────────────────────────────
      // Role assignment: PIN owner (target) = mentor, requester = student.
      // Both must be premium for a connection — unless the temp flag bypasses it.
      if (!SKIP_PREMIUM_CHECK_TEMP) {
        // Check requester's premium status (from context — already loaded)
        if (!isPremium) {
          navigation.navigate('Paywall');
          return;
        }

        // Check target's premium status (from Firestore)
        const targetIsPremium =
          targetUser.subscription_status === 'premium';

        if (!targetIsPremium) {
          Alert.alert(
            'Partner Not Premium',
            `${targetUser.name} doesn't have a Premium subscription yet. Both partners must be Premium to connect.`,
            [{ text: 'OK' }]
          );
          return;
        }
      }
      // When SKIP_PREMIUM_CHECK_TEMP is true, we fall straight through to here.

      // ── Step 4: Prevent duplicate connections ─────────────────────────────
      const connectionsRef = collection(db, 'connections');

      // Check if a request already exists between these two users (in either direction)
      const existingAsRequester = await getDocs(
        query(
          connectionsRef,
          where('requester_id', '==', currentUser.uid),
          where('target_id', '==', targetUser.id),
          where('status', 'in', ['pending', 'active'])
        )
      );

      const existingAsTarget = await getDocs(
        query(
          connectionsRef,
          where('requester_id', '==', targetUser.id),
          where('target_id', '==', currentUser.uid),
          where('status', 'in', ['pending', 'active'])
        )
      );

      if (!existingAsRequester.empty || !existingAsTarget.empty) {
        setError(
          'You already have a pending or active connection with this person.'
        );
        return;
      }

      // ── Step 5: Create the connection document ────────────────────────────
      // Role assignment: PIN owner (target) = mentor, requester = student.
      const newConnectionRef = await addDoc(connectionsRef, {
        requester_id: currentUser.uid,
        target_id: targetUser.id,
        mentor_id: targetUser.id,   // PIN owner is the mentor
        student_id: currentUser.uid, // requester is the student
        status: 'pending',
        created_at: serverTimestamp(),
      });

      // Write the doc ID back onto the document for easy reference
      // (optional — we skip a second write here; the ID is the doc ref ID)

      Alert.alert(
        'Request Sent! 🎉',
        `Your connection request has been sent to ${targetUser.name}. Once they accept, you'll appear in each other's connections.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setPin('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      console.error('ConnectScreen: handleConnect error', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <UserPlus size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.headline}>Connect with a Partner</Text>
            <Text style={styles.subheadline}>
              Ask your accountability partner to share their PIN with you, then
              enter it below.
            </Text>
          </View>

          {/* Role clarification */}
          <View style={styles.roleCard}>
            <Text style={styles.roleCardTitle}>How roles work</Text>
            <Text style={styles.roleCardText}>
              The person whose PIN you enter becomes your{' '}
              <Text style={styles.bold}>mentor</Text> — they hold you
              accountable. You become their{' '}
              <Text style={styles.bold}>student</Text>.
            </Text>
          </View>

          {/* PIN Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Partner's PIN</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="e.g. A3X9K2"
              placeholderTextColor="#9CA3AF"
              value={pin}
              onChangeText={(text) => {
                setPin(text.toUpperCase());
                if (error) setError('');
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              returnKeyType="done"
              onSubmitEditing={handleConnect}
              accessibilityLabel="Partner PIN input"
            />

            {/* Error message */}
            {!!error && (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Dev note when flag is active */}
          {SKIP_PREMIUM_CHECK_TEMP && (
            <View style={styles.devNotice}>
              <Text style={styles.devNoticeText}>
                🛠 DEV: Premium check bypassed (SKIP_PREMIUM_CHECK_TEMP = true)
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleConnect}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Send connection request"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Send Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Role card
  roleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleCardText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  // Input
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pinInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 4,
    textAlign: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
  },
  // Dev notice
  devNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  devNoticeText: {
    fontSize: 11,
    color: '#92400E',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  // Submit
  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ConnectScreen;
