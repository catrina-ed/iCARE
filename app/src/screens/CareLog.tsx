import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import { THEME } from 'shared/theme';
import { CARE_LOG, USERS } from 'shared/data';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export function CareLogScreen() {
  const [isComposing, setIsComposing] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const handleSave = () => {
    if (newEntry.trim()) {
      setNewEntry('');
      setIsConfidential(false);
      setIsComposing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Care Log</Text>
        </View>

        {/* Compose Card */}
        {isComposing ? (
          <Card style={styles.composeCard} padded>
            <Text style={styles.composeLabel}>Add a note</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's happening with Mom?"
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={4}
              value={newEntry}
              onChangeText={setNewEntry}
            />
            <View style={styles.composeFooter}>
              <Pressable onPress={() => setIsConfidential(!isConfidential)}>
                <Text style={styles.confidentialToggle}>
                  {isConfidential ? '🔒 Private' : '👁️ Shared'}
                </Text>
              </Pressable>
              <View style={styles.composeButtons}>
                <Pressable onPress={() => setIsComposing(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ) : (
          <Pressable
            onPress={() => setIsComposing(true)}
            style={styles.composeButton}
          >
            <Text style={styles.composeButtonText}>+ Add Note</Text>
          </Pressable>
        )}

        {/* Care Log Entries */}
        {CARE_LOG.map(entry => {
          const author = USERS[entry.author];
          const timestamp = new Date(entry.timestamp);
          const time = timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          return (
            <Card
              key={entry.id}
              style={[
                styles.logCard,
                entry.confidential && styles.logCardConfidential,
              ]}
              padded
            >
              <View style={styles.logHeader}>
                <View>
                  <Text style={styles.logAuthor}>{author?.name || 'Unknown'}</Text>
                  <Text style={styles.logTime}>{time}</Text>
                </View>
                {entry.confidential && (
                  <Badge label="Private" color="info" />
                )}
              </View>
              <Text style={styles.logTag}>{entry.tag}</Text>
              <Text style={styles.logText}>{entry.text}</Text>
            </Card>
          );
        })}
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
  composeButton: {
    backgroundColor: THEME.colors.bgElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    alignItems: 'center',
  },
  composeButtonText: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '500',
    color: THEME.colors.primary,
  },
  composeCard: {
    marginBottom: THEME.spacing.xl,
  },
  composeLabel: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  textInput: {
    backgroundColor: THEME.colors.bg,
    color: THEME.colors.text,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.base,
    fontFamily: THEME.typography.fontFamily.default,
  },
  composeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidentialToggle: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: '500',
    color: THEME.colors.primary,
    padding: THEME.spacing.sm,
  },
  composeButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  cancelBtnText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.radius.md,
  },
  saveBtnText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.bg,
    fontWeight: '600',
  },
  logCard: {
    marginBottom: THEME.spacing.lg,
  },
  logCardConfidential: {
    borderColor: THEME.colors.confidential,
    backgroundColor: THEME.colors.confidential + '15',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  logAuthor: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  logTime: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.xs,
  },
  logTag: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: '500',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.sm,
  },
  logText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.text,
    lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.base,
  },
});
