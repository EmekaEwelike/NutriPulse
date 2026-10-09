import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
    { id: 'log', label: 'Log Food', icon: '🥗' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Text style={styles.iconText}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconContainer: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  activeIconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  iconText: {
    fontSize: 18
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  activeLabel: {
    color: COLORS.primaryLight,
    fontWeight: '700'
  }
});
