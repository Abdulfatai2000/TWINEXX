import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Crown, Calendar, RotateCcw, ExternalLink } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';

// Deep-link to native subscription management
const MANAGE_SUBSCRIPTION_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

const SubscriptionScreen = ({ navigation }) => {
  const { isPremium, expiresAt, premiumLoading, restorePurchases } =
    useSubscription();
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        Alert.alert(
          result.isPremium ? '✅ Purchases Restored' : 'No Active Subscription',
          result.isPremium
            ? 'Your Premium subscription has been restored.'
            : "We couldn't find an active Premium subscription linked to your account.",
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Restore Failed',
          result.error || 'Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    const canOpen = await Linking.canOpenURL(MANAGE_SUBSCRIPTION_URL);
    if (canOpen) {
      await Linking.openURL(MANAGE_SUBSCRIPTION_URL);
    } else {
      Alert.alert('Unavailable', 'Could not open subscription settings.');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (premiumLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={[styles.statusCard, isPremium && styles.statusCardPremium]}>
          <View style={styles.statusTop}>
            <Crown
              size={28}
              color={isPremium ? '#000000' : '#9CA3AF'}
              fill={isPremium ? '#000000' : 'none'}
            />
            <View style={styles.statusTextGroup}>
              <Text
                style={[styles.statusLabel, isPremium && styles.statusLabelPremium]}
              >
                {isPremium ? 'Premium' : 'Free'}
              </Text>
              <Text style={styles.statusSubLabel}>
                {isPremium ? 'Active subscription' : 'Basic plan'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isPremium ? styles.statusBadgePremium : styles.statusBadgeFree,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPremium
                    ? styles.statusBadgeTextPremium
                    : styles.statusBadgeTextFree,
                ]}
              >
                {isPremium ? 'ACTIVE' : 'FREE'}
              </Text>
            </View>
          </View>

          {isPremium && expiresAt && (
            <View style={styles.expiryRow}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.expiryText}>
                Renews on {formatDate(expiresAt)}
              </Text>
            </View>
          )}
        </View>

        {/* What's included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isPremium ? 'Your Premium Benefits' : 'Free Plan Includes'}
          </Text>

          {isPremium ? (
            <>
              <FeatureRow
                emoji="✅"
                text="Solo to-do list (unlimited tasks)"
              />
              <FeatureRow
                emoji="✅"
                text="Accountability partner pairing (when pairing launches)"
              />
              <FeatureRow emoji="✅" text="All future premium features" />
            </>
          ) : (
            <>
              <FeatureRow emoji="✅" text="Solo to-do list (unlimited tasks)" />
              <FeatureRow
                emoji="🔒"
                text="Accountability partner pairing — Premium only"
                locked
              />
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isPremium ? (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageSubscription}
              accessibilityRole="button"
              accessibilityLabel="Manage subscription in app store"
            >
              <ExternalLink size={18} color="#000000" />
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Paywall')}
              accessibilityRole="button"
              accessibilityLabel="Go Premium"
            >
              <Crown size={18} color="#FFFFFF" />
              <Text style={styles.upgradeButtonText}>Go Premium</Text>
            </TouchableOpacity>
          )}

          {/* Restore Purchases — always visible (required by App Store guidelines) */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={restoring}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            {restoring ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <>
                <RotateCcw size={16} color="#6B7280" />
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          To cancel your subscription, use the Manage Subscription button above.
          Cancellations take effect at the end of the current billing period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureRow = ({ emoji, text, locked }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={[styles.featureText, locked && styles.featureTextLocked]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  // Status card
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusCardPremium: {
    backgroundColor: '#F8F8F8',
    borderColor: '#D1D5DB',
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTextGroup: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  statusLabelPremium: {
    color: '#111827',
  },
  statusSubLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgePremium: {
    backgroundColor: '#111827',
  },
  statusBadgeFree: {
    backgroundColor: '#E5E7EB',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusBadgeTextPremium: {
    color: '#FFFFFF',
  },
  statusBadgeTextFree: {
    color: '#6B7280',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expiryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 16,
    lineHeight: 22,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  featureTextLocked: {
    color: '#9CA3AF',
  },
  // Actions
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  manageButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  // Legal
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default SubscriptionScreen;
