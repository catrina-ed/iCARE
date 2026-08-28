import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { THEME } from 'shared/theme';
import { APPOINTMENTS, USERS } from 'shared/data';
import { Card } from '../components/Card';

export function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {APPOINTMENTS.map(appt => (
          <Card key={appt.id} style={styles.appointmentCard} padded>
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>
                  {new Date(appt.date).getDate()}
                </Text>
              </View>
              <View style={styles.apptDetails}>
                <Text style={styles.apptTitle}>{appt.title}</Text>
                <Text style={styles.apptProvider}>{appt.provider}</Text>
                <Text style={styles.apptTime}>
                  {appt.startTime} – {appt.endTime}
                </Text>
              </View>
            </View>
            <View style={styles.assignedRow}>
              <Text style={styles.assignedLabel}>Assigned to</Text>
              <Text style={styles.assignedName}>{USERS[appt.assignedTo]?.name || 'Unknown'}</Text>
            </View>
            {appt.prepNotes && (
              <Text style={styles.prepNotes}>📋 {appt.prepNotes}</Text>
            )}
          </Card>
        ))}
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
    paddingBottom: THEME.spacing.xl * 2,
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSize['2xl'],
    fontWeight: '700',
    color: THEME.colors.text,
  },
  appointmentCard: {
    marginBottom: THEME.spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  dateBox: {
    backgroundColor: THEME.colors.primary,
    width: 50,
    height: 50,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: '700',
    color: THEME.colors.bg,
  },
  apptDetails: {
    flex: 1,
  },
  apptTitle: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  apptProvider: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.xs,
  },
  apptTime: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: '500',
    marginTop: THEME.spacing.xs,
  },
  assignedRow: {
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedLabel: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  assignedName: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  prepNotes: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.md,
  },
});
