import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.bgCard }]}>
        <Ionicons name={icon} size={40} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', textAlign: 'center' },
});
