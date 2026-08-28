import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { THEME, COLORS } from 'shared/theme';
import {
  GAIL, USERS, TODAYS_DOSES_MORNING, CARE_LOG,
  ALERTS_MORNING_CALM, ALERTS_MORNING_ALERT, MEDICATIONS,
} from 'shared/data';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { DoseStatusIndicator } from '../components/DoseStatus';

export function HomeScreen() {
  const [showAlerts, setShowAlerts] = useState(false);
  const [currentUser, setCurrentUser] = useState('trina');

  const user = USERS[currentUser];
  const alerts = showAlerts ? ALERTS_MORNING_ALERT : ALERTS_MORNING_CALM;
  const doses = TODAYS_DOSES_MORNING;

  // Calculate summary
  const givenCount = doses.filter(d => d.status === 'given').length;
  const upcomingCount = doses.filter(d => d.status === 'upcoming' || d.status === 'due').length;
  const missedCount = doses.filter(d => d.status === 'missed').length;

  const getMedicationName = (id: string) => {
    const med = MEDICATIONS.find(m => m.id === id);
    return med?.name || 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <Pressable
            onPress={() => setShowAlerts(!showAlerts)}
            style={styles.alertToggle}
          >
            <Text style={styles.toggleText}>🚨</Text>
          </Pressable>
        </View>

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts.map(alert => (
              <Alert
                key={alert.id}
                type={alert.severity as 'info' | 'warn' | 'danger'}
                title={alert.title}
                subtitle={alert.subtitle}
              />
            ))}
          </View>
        )}

        {/* Today's Summary Card */}
        <Card style={styles.summaryCard} raised>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{givenCount}</Text>
              <Text style={styles.summaryLabel}>Doses Given</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{upcomingCount}</Text>
              <Text style={styles.summaryLabel}>Coming Up</Text>
            </View>
            {missedCount > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.danger }]}>
                  {missedCount}
                </Text>
                <Text style={styles.summaryLabel}>Missed</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>💊</Text>
              <Text style={styles.actionLabel}>Log Dose</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>Add Note</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>✓</Text>
              <Text style={styles.actionLabel}>Task Done</Text>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Doses */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>Today's Doses</Text>
          {doses.slice(0, 5).map(dose => {
            const med = MEDICATIONS.find(m => m.id === dose.medicationId);
            return (
              <View key={dose.id} style={styles.doseItem}>
                <View style={styles.doseInfo}>
                  <Text style={styles.doseTime}>{dose.time}</Text>
                  <View>
                    <Text style={styles.doseName}>{med?.name}</Text>
                    <Text style={styles.doseDetails}>{med?.dose}</Text>
                  </View>
                </View>
                <DoseStatusIndicator status={dose.status} size="sm" />
              </View>
            );
          })}
        </Card>

        {/* Recent Care Log */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>Recent Notes</Text>
          {CARE_LOG.slice(0, 3).map(entry => (
            <View key={entry.id} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={styles.logTime}>{entry.timestamp.split('T')[1]?.slice(0, 5)}</Text>
                <Text style={styles.logAuthor}>{USERS[entry.author]?.name || 'Unknown'}</Text>
                {entry.confidential && (
                  <Badge label="Private" color="info" size="sm" />
                )}
              </View>
              <Text style={styles.logText}>{entry.text}</Text>
            </View>
          ))}
        </Card>

        {/* Who's On */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>On Duty</Text>
          <View style={styles.onDutyInfo}>
            <View style={styles.onDutyAvatar}>
              <Text style={styles.avatarText}>CA</Text>
            </View>
            <View>
              <Text style={styles.onDutyName}>Catina</Text>
              <Text style={styles.onDutyTime}>8:00 AM – 6:00 PM</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl * 2, // account for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.xl,
  },
  greeting: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.xs,
  },
  name: {
    fontSize: THEME.typography.fontSize['2xl'],
    fontWeight: '700',
    color: THEME.colors.text,
  },
  alertToggle: {
    padding: THEME.spacing.md,
  },
  toggleText: {
    fontSize: THEME.typography.fontSize.xl,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  summaryCard: {
    marginBottom: THEME.spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: THEME.typography.fontSize['3xl'],
    fontWeight: '700',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.xs,
  },
  summaryLabel: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: THEME.colors.bgElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  actionIcon: {
    fontSize: THEME.typography.fontSize['2xl'],
  },
  actionLabel: {
    fontSize: THEME.typography.fontSize.xs,
    color: THEME.colors.text,
    fontWeight: '500',
  },
  doseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  doseInfo: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    flex: 1,
  },
  doseTime: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.primary,
    minWidth: 40,
  },
  doseName: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  doseDetails: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  logEntry: {
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  logTime: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  logAuthor: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  logText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.text,
    lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.sm,
  },
  onDutyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  onDutyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.warn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '700',
    color: THEME.colors.bg,
  },
  onDutyName: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  onDutyTime: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
});
