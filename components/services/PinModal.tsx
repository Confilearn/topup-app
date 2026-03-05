import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { MOCK_PIN } from '@/lib/mockData';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function PinModal({ visible, onClose, onSuccess, title = 'Enter Transaction PIN' }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    if (text.length > 4) return;
    setPin(text);
    setError('');
    if (text.length === 4) {
      handleSubmit(text);
    }
  };

  const handleSubmit = async (value: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    if (value === MOCK_PIN) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPin('');
      onSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={24} color={COLORS.purple} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Enter your 4-digit PIN to confirm</Text>
          </View>

          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            style={styles.hiddenInput}
            autoFocus
          />

          <Pressable onPress={() => inputRef.current?.focus()}>
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    pin.length > i && styles.dotFilled,
                    error && styles.dotError,
                  ]}
                />
              ))}
            </View>
          </Pressable>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          {loading && <ActivityIndicator color={COLORS.purple} style={{ marginTop: 16 }} />}

          <Text style={styles.hint}>Use PIN: {MOCK_PIN} (demo)</Text>

          <Pressable style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.purple}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  dotError: {
    borderColor: COLORS.error,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    marginBottom: 8,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
});
