import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'outline' | 'ghost';
}

export function GradientButton({ onPress, title, loading, disabled, style, variant = 'primary' }: GradientButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.outlineBtn,
          { borderColor: colors.purple },
          style,
          (disabled || loading) && styles.disabled,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={[styles.outlineText, { color: colors.purpleLight }]}>{title}</Text>
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.ghostBtn, style, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.ghostText, { color: colors.purpleLight }]}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        style,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={['#7C3AED', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, overflow: 'hidden' },
  gradient: { paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold', letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
  outlineBtn: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center' },
  outlineText: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  ghostBtn: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  ghostText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
});
