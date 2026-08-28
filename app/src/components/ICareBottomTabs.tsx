import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, SafeAreaView } from 'react-native';
import { THEME } from 'shared/theme';
import { HomeScreen } from '../screens/Home';
import { MedsScreen } from '../screens/Meds';
import { CalendarScreen } from '../screens/Calendar';
import { CareLogScreen } from '../screens/CareLog';

type TabId = 'home' | 'meds' | 'calendar' | 'carelog' | 'more';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'meds', label: 'Meds', icon: '💊' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'carelog', label: 'Notes', icon: '📝' },
  { id: 'more', label: 'More', icon: '⋯' },
];

export default function ICareBottomTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'meds':
        return <MedsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'carelog':
        return <CareLogScreen />;
      case 'more':
        return (
          <SafeAreaView style={[styles.screenContainer, { paddingHorizontal: THEME.spacing.lg }]}>
            <Text style={styles.screenTitle}>More</Text>
            <Text style={styles.placeholder}>Supplies, Bills, Handoffs, Emergency, Settings</Text>
          </SafeAreaView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  content: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: THEME.typography.fontSize['2xl'],
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
  },
  placeholder: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textMuted,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: 8, // account for home indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.xs,
  },
  tabActive: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: THEME.typography.fontSize.xl,
  },
  tabLabel: {
    fontSize: THEME.typography.fontSize.xs,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '600',
  },
});
