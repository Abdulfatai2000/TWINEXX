import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { GraduationCap, Shield } from 'lucide-react-native';
import useConnections from '../hooks/useConnections';

const ConnectionsScreen = () => {
  const { connections, loading } = useConnections();

  const mentoring = connections.filter((c) => c.myRole === 'mentor');
  const learning = connections.filter((c) => c.myRole === 'student');

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Connections</Text>
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
        <Text style={styles.title}>My Connections</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{connections.length}</Text>
        </View>
      </View>

      {connections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={styles.emptyTitle}>No active connections yet</Text>
          <Text style={styles.emptySubtitle}>
            Once a partner accepts your request (or you accept theirs), they'll
            show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            // Section headers + items interleaved
            ...(mentoring.length > 0
              ? [
                  { type: 'header', key: 'h-mentoring', label: 'I hold accountable', icon: 'shield' },
                  ...mentoring.map((c) => ({ type: 'item', key: c.id, ...c })),
                ]
              : []),
            ...(learning.length > 0
              ? [
                  { type: 'header', key: 'h-learning', label: 'They hold me accountable', icon: 'grad' },
                  ...learning.map((c) => ({ type: 'item', key: c.id, ...c })),
                ]
              : []),
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              const Icon = item.icon === 'shield' ? Shield : GraduationCap;
              return (
                <View style={styles.sectionHeader}>
                  <Icon size={14} color="#6B7280" />
                  <Text style={styles.sectionHeaderText}>
                    {item.label.toUpperCase()}
                  </Text>
                </View>
              );
            }

            // item.type === 'item'
            return (
              <View style={styles.card}>
                <View style={[
                  styles.cardAvatar,
                  item.myRole === 'mentor' ? styles.cardAvatarMentor : styles.cardAvatarStudent,
                ]}>
                  <Text style={styles.cardAvatarText}>
                    {item.otherUserName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.otherUserName}</Text>
                  <Text style={styles.cardRoleText}>
                    {item.myRole === 'mentor'
                      ? '🛡️ You mentor them'
                      : '🎓 They mentor you'}
                  </Text>
                </View>

                <View style={[
                  styles.rolePill,
                  item.myRole === 'mentor' ? styles.rolePillMentor : styles.rolePillStudent,
                ]}>
                  <Text style={[
                    styles.rolePillText,
                    item.myRole === 'mentor' ? styles.rolePillTextMentor : styles.rolePillTextStudent,
                  ]}>
                    {item.myRole === 'mentor' ? 'Mentor' : 'Student'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
  totalBadge: {
    backgroundColor: '#111827',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  totalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
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
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  // Connection card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarMentor: {
    backgroundColor: '#111827',
  },
  cardAvatarStudent: {
    backgroundColor: '#374151',
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
  cardRoleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Role pill
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rolePillMentor: {
    backgroundColor: '#111827',
  },
  rolePillStudent: {
    backgroundColor: '#F3F4F6',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rolePillTextMentor: {
    color: '#FFFFFF',
  },
  rolePillTextStudent: {
    color: '#374151',
  },
});

export default ConnectionsScreen;
