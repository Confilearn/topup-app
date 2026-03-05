import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { MOCK_PIN } from '@/lib/mockData';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function PinModal({ visible, onClose, onSuccess, title = 'Enter Transaction PIN' }: PinModalProps) {
  const colors = useColors();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length === 4) {
      handleSubmit(newPin);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (value: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);

    if (value === MOCK_PIN) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPin('');
      setError('');
      onSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Incorrect PIN. Try again.');
      setPin('');
      setShakeKey((k) => k + 1);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const KEYPAD = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.bgSecondary }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.lockIcon, { backgroundColor: `${colors.purple}20` }]}>
              <Ionicons name="lock-closed" size={24} color={colors.purple} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter your 4-digit PIN</Text>
          </View>

          {/* PIN dots */}
          <View style={styles.dotsRow} key={shakeKey}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    borderColor: error ? colors.error : pin.length > i ? colors.purple : colors.border,
                    backgroundColor: pin.length > i ? colors.purple : 'transparent',
                  },
                ]}
              />
            ))}
          </View>

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          {loading ? <ActivityIndicator color={colors.purple} style={{ marginVertical: 8 }} /> : null}

          {/* Hint */}
          <Text style={[styles.hint, { color: colors.textMuted }]}>Demo PIN: {MOCK_PIN}</Text>

          {/* On-screen keypad */}
          <View style={styles.keypad}>
            {KEYPAD.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => {
                  if (key === '') {
                    return <View key={ki} style={styles.keyEmpty} />;
                  }
                  if (key === 'del') {
                    return (
                      <Pressable
                        key={ki}
                        style={({ pressed }) => [
                          styles.key,
                          { backgroundColor: pressed ? `${colors.purple}20` : `${colors.bgCardAlt}` },
                        ]}
                        onPress={handleDelete}
                      >
                        <Ionicons name="backspace-outline" size={22} color={colors.textPrimary} />
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      key={ki}
                      style={({ pressed }) => [
                        styles.key,
                        { backgroundColor: pressed ? `${colors.purple}20` : colors.bgCardAlt },
                      ]}
                      onPress={() => handleDigit(key)}
                      disabled={loading}
                    >
                      <Text style={[styles.keyText, { color: colors.textPrimary }]}>{key}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable style={styles.cancelBtn} onPress={handleClose}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  error: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 20,
  },
  keypad: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  key: {
    width: 88,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 88,
    height: 64,
  },
  keyText: {
    fontSize: 24,
    fontFamily: 'Nunito_600SemiBold',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
});
