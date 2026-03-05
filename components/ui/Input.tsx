import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, leftIcon, isPassword, style, ...props }: InputProps) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bgInput,
            borderColor: focused ? colors.purple : error ? colors.error : colors.border,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, { color: colors.textPrimary }, style as any]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Nunito_400Regular' },
  inputWithIcon: { paddingLeft: 8 },
  leftIcon: { paddingLeft: 14 },
  eyeIcon: { paddingRight: 14, paddingVertical: 14 },
  error: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
});
