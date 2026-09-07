import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { LogOut, UserPlus, Users, Bell } from 'lucide-react-native';
import PinDisplay from '../components/PinDisplay';
import { authAPI } from '../utils/api';

const MyPinScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch this user's PIN from MongoDB via the API
  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await authAPI.me();
        setPin(res.data.pin);
      } catch (error) {
        console.error('MyPinScreen: Error fetching PIN:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('MyPinScreen: Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Partners</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityLabel="Log out">
          <LogOut size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* PIN section */}
      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Your PIN</Text>
        <Text style={styles.pinSubLabel}>
          Share this with someone who wants to connect with you.
          They'll enter it and you'll become their mentor.
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#000000" style={{ marginTop: 12 }} />
        ) : pin ? (
          <PinDisplay pin={pin} />
        ) : (
          <Text style={styles.noPin}>No PIN available</Text>
        )}
      </View>

      {/* Navigation buttons */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsLabel}>Partner Tools</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Connect')}
          accessibilityRole="button"
          accessibilityLabel="Connect with a partner"
        >
          <View style={styles.actionIconWrap}>
            <UserPlus size={20} color="#111827" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Connect with a Partner</Text>
            <Text style={styles.actionSubtitle}>
              Enter someone's PIN to send a request
            </Text>
          </View>
          <Text style={styles.actionChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Incoming')}
          accessibilityRole="button"
          accessibilityLabel="Incoming requests"
        >
          <View style={styles.actionIconWrap}>
            <Bell size={20} color="#111827" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Incoming Requests</Text>
            <Text style={styles.actionSubtitle}>
              Check for pending requests
            </Text>
          </View>
          <Text style={styles.actionChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Connections')}
          accessibilityRole="button"
          accessibilityLabel="My connections"
        >
          <View style={styles.actionIconWrap}>
            <Users size={20} color="#111827" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>My Connections</Text>
            <Text style={styles.actionSubtitle}>
              View your active accountability partners
            </Text>
          </View>
          <Text style={styles.actionChevron}>›</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
  },
  pinSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pinSubLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  noPin: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  actionsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionChevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MyPinScreen;