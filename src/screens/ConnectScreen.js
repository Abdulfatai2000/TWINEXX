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
import { useAuth } from '@clerk/clerk-expo';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { ConnectionService, registerLocalUser } from '../services';
import { isDevelopmentSubscriptionMode, DEV_FLAGS } from '../config/dev';

const ConnectScreen = ({ navigation }) => {
  const { userId, isSignedIn } = useAuth();
  const { isPremium } = useSubscription();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In development subscription mode, simulate premium
  const effectiveIsPremium = isDevelopmentSubscriptionMode() ? true : isPremium;

  const handleConnect = async () => {
    const trimmedPin = pin.trim().toUpperCase();
    if (!trimmedPin) {
      setError('Please enter a PIN.');
      return;
    }

    if (!userId || !isSignedIn) {
      setError('Please log in to connect with a partner.');
      return;
    }

    // Premium gate - in development mode, always allow
    if (!effectiveIsPremium) {
      setError('Premium subscription required to connect with a partner.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user's name for the request
      const { UserProfileService } = await import('../services');
      const profile = await UserProfileService.getProfile(userId);
      const userName = profile?.name || 'Unknown';

      // Register current user in local registry
      const { PinService } = await import('../services');
      const myPin = await PinService.getPin(userId);
      registerLocalUser(userId, userName, myPin);

      const data = await ConnectionService.sendConnectionRequest(userId, userName, trimmedPin);

      Alert.alert(
        'Request Sent!',
        `Your connection request has been sent to ${data.targetName || 'your partner'}. Once they accept, you'll appear in each other's connections.`,
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
      if (err.message?.includes('PIN')) {
        setError(err.message);
      } else if (err.message?.includes('connection') || err.message?.includes('pending')) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
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

          <View style={styles.roleCard}>
            <Text style={styles.roleCardTitle}>How roles work</Text>
            <Text style={styles.roleCardText}>
              The person whose PIN you enter becomes your{' '}
              <Text style={styles.bold}>mentor</Text> — they hold you
              accountable. You become their{' '}
              <Text style={styles.bold}>student</Text>.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Partner's PIN</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="e.g. 123456"
              placeholderTextColor="#9CA3AF"
              value={pin}
              onChangeText={(text) => {
                setPin(text.toUpperCase());
                if (error) setError('');
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleConnect}
              accessibilityLabel="Partner PIN input"
            />

            {!!error && (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {DEV_FLAGS.SHOW_DEV_BADGES && isDevelopmentSubscriptionMode() && (
            <View style={styles.devNotice}>
              <Text style={styles.devNoticeText}>
                DEV MODE: Premium bypassed for testing
              </Text>
            </View>
          )}

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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  heroSection: { alignItems: 'center', marginBottom: 28 },
  iconContainer: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#111827',
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
  },
  headline: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 10 },
  subheadline: { fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 22 },
  roleCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 28,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  roleCardTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleCardText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#111827' },
  inputSection: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  pinInput: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#D1D5DB',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16,
    fontSize: 22, fontWeight: '700', color: '#111827', letterSpacing: 4,
    textAlign: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  errorText: { flex: 1, fontSize: 13, color: '#EF4444', lineHeight: 18 },
  devNotice: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 20 },
  devNoticeText: { fontSize: 11, color: '#92400E' },
  submitButton: { backgroundColor: '#111827', paddingVertical: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});

export default ConnectScreen;