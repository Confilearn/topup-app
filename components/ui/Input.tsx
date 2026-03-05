import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, leftIcon, isPassword, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, style as any]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  containerFocused: {
    borderColor: COLORS.purple,
  },
  containerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  leftIcon: {
    paddingLeft: 14,
  },
  eyeIcon: {
    paddingRight: 14,
    paddingVertical: 14,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
});
