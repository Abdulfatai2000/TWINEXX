import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Crown, Check, Users, Zap, Shield } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';

const FEATURES = [
  {
    icon: Users,
    title: 'Connect with an Accountability Partner',
    desc: 'Pair with someone you trust to keep each other on track.',
  },
  {
    icon: Zap,
    title: 'Shared Commitment Tracking',
    desc: 'See each other\'s tasks and progress in real time (coming soon).',
  },
  {
    icon: Shield,
    title: 'Check-in & Verification',
    desc: 'Confirm progress with your partner to stay accountable (coming soon).',
  },
];

const PaywallScreen = ({ navigation }) => {
  const { purchasePremium, restorePurchases, isPremium } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = async () => {
    if (isPremium) {
      navigation.goBack();
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePremium();

      if (result.success) {
        Alert.alert(
          '🎉 Welcome to Premium!',
          'Your subscription is now active. You\'re all set to connect with an accountability partner once pairing is available.',
          [{ text: 'Great!', onPress: () => navigation.goBack() }]
        );
      } else if (result.cancelled) {
        // User cancelled — do nothing, no error shown
      } else {
        Alert.alert(
          'Purchase Failed',
          result.error ||
            'Something went wrong during the purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();

      if (result.success) {
        if (result.isPremium) {
          Alert.alert(
            'Purchases Restored!',
            'Your Premium subscription has been restored.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            'No Active Subscription Found',
            'We couldn\'t find an active Premium subscription linked to your account.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Restore Failed', result.error || 'Please try again later.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Close paywall"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.crownContainer}>
            <Crown size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.headline}>Unlock Accountability</Text>
          <Text style={styles.subheadline}>
            Go Premium to connect with an accountability partner and achieve
            your goals together.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.featuresCard}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View
                key={index}
                style={[
                  styles.featureRow,
                  index < FEATURES.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={styles.featureIconWrap}>
                  <Icon size={20} color="#000000" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
                <Check size={18} color="#22C55E" />
              </View>
            );
          })}
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Premium Plan</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>₦4,999</Text>
            <Text style={styles.pricePer}>/month</Text>
          </View>
          <Text style={styles.priceNote}>
            Price placeholder — will update once configured in the store
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.subscribeButton, purchasing && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={purchasing || restoring}
          accessibilityRole="button"
          accessibilityLabel="Subscribe to TWINIX Premium"
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {isPremium ? 'You\'re already Premium ✓' : 'Subscribe Now'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={purchasing || restoring}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          {restoring ? (
            <ActivityIndicator color="#6B7280" size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          Subscription renews automatically. Cancel anytime through your device
          subscription settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Features card
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  // Price
  priceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
  },
  pricePer: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceNote: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // CTA
  subscribeButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Restore
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  // Legal
  legalNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PaywallScreen;
