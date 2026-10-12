import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function Header({ profile, onOpenProfile, authState, onOpenAuth }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const currentUser = authState?.user;
  const displayName = currentUser?.name || profile?.name || 'Friend';

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <TouchableOpacity style={styles.avatar} onPress={onOpenProfile}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        {currentUser ? (
          <View style={styles.streakBadge}>
            <Text style={styles.flameIcon}>🔥</Text>
            <Text style={styles.streakText}>{profile.streakDays || 14}d</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.signInPill} onPress={onOpenAuth}>
            <Text style={styles.signInPillText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  textContainer: {
    marginLeft: 12
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700'
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  flameIcon: {
    fontSize: 16,
    marginRight: 4
  },
  streakText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 14
  },
  signInPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },
  signInPillText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 13
  }
});
