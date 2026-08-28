import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { THEME } from 'shared/theme';
import { MEDICATIONS, TODAYS_DOSES_MORNING } from 'shared/data';
import { Card } from '../components/Card';
import { DoseStatusIndicator } from '../components/DoseStatus';

export function MedsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Medications</Text>
        </View>

        <Card style={styles.section} padded>
          {TODAYS_DOSES_MORNING.map(dose => {
            const med = MEDICATIONS.find(m => m.id === dose.medicationId);
            return (
              <View key={dose.id} style={styles.doseRow}>
                <View style={styles.doseLeft}>
                  <Text style={styles.doseTime}>{dose.time}</Text>
                  <View>
                    <Text style={styles.doseName}>{med?.name}</Text>
                    <Text style={styles.doseDose}>{med?.dose}</Text>
                  </View>
                </View>
                <DoseStatusIndicator status={dose.status} size="sm" />
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>Refill Status</Text>
        <Card style={styles.section} padded>
          {MEDICATIONS.map(med => (
            <View key={med.id} style={styles.refillRow}>
              <View>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.refillDays}>{med.refillDue} days until refill</Text>
              </View>
              {med.lowStock && <Text style={styles.lowStockBadge}>⚠️ Low</Text>}
            </View>
          ))}
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
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.xl,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  doseLeft: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    flex: 1,
  },
  doseTime: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.primary,
    minWidth: 50,
  },
  doseName: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  doseDose: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  refillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  medName: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  refillDays: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
  },
  lowStockBadge: {
    fontSize: THEME.typography.fontSize.base,
  },
});
