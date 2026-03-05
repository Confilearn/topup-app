import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { GradientButton } from '@/components/ui/GradientButton';
import { ResultModal } from './ResultModal';
import { MOCK_PIN } from '@/lib/mockData';

interface ServiceSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: (disabled: boolean) => React.ReactNode;
  onProceed: () => boolean;
  onConfirmed: () => void;
  proceedLabel: string;
  proceedDisabled: boolean;
}

type Stage = 'form' | 'pin' | 'result';

export function ServiceSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  onProceed,
  onConfirmed,
  proceedLabel,
  proceedDisabled,
}: ServiceSheetModalProps) {
  const colors = useColors();
  const [stage, setStage] = useState<Stage>('form');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const handleProceed = () => {
    if (proceedDisabled) return;
    const ok = onProceed();
    if (ok !== false) {
      setStage('pin');
      setPin('');
      setPinError('');
    }
  };

  const handleDigit = async (digit: string) => {
    if (loading || pin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + digit;
    setPin(newPin);
    setPinError('');

    if (newPin.length === 4) {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);

      if (newPin === MOCK_PIN) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPin('');
        onConfirmed();
        setStage('form');
        handleClose();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPinError('Incorrect PIN. Try again.');
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
    setPinError('');
  };

  const handleClose = () => {
    setStage('form');
    setPin('');
    setPinError('');
    setResult(null);
    onClose();
  };

  const KEYPAD = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <>
      <Modal visible={visible && !result} animationType="slide" transparent onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.bgSecondary, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }]}
            onPress={() => {}}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {stage === 'form' ? (
              <>
                <View style={styles.headerRow}>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{title}</Text>
                  <Pressable onPress={handleClose}>
                    <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                  </Pressable>
                </View>
                <Text style={[styles.sheetSub, { color: colors.textMuted }]}>{subtitle}</Text>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                  <View style={styles.form}>
                    {children(false)}
                    <GradientButton
                      title={proceedLabel}
                      onPress={handleProceed}
                      disabled={proceedDisabled}
                    />
                  </View>
                </ScrollView>
              </>
            ) : (
              <View style={styles.pinView}>
                <View style={[styles.lockIcon, { backgroundColor: `${colors.purple}20` }]}>
                  <Ionicons name="lock-closed" size={28} color={colors.purple} />
                </View>
                <Text style={[styles.pinTitle, { color: colors.textPrimary }]}>Enter Transaction PIN</Text>
                <Text style={[styles.pinSub, { color: colors.textMuted }]}>Enter your 4-digit PIN to confirm</Text>

                <View style={styles.dotsRow}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          borderColor: pinError ? colors.error : pin.length > i ? colors.purple : colors.border,
                          backgroundColor: pin.length > i ? colors.purple : 'transparent',
                        },
                      ]}
                    />
                  ))}
                </View>

                {pinError ? <Text style={[styles.pinError, { color: colors.error }]}>{pinError}</Text> : null}
                <Text style={[styles.pinHint, { color: colors.textMuted }]}>Demo PIN: {MOCK_PIN}</Text>

                <View style={styles.keypad}>
                  {KEYPAD.map((row, ri) => (
                    <View key={ri} style={styles.keyRow}>
                      {row.map((key, ki) => {
                        if (key === '') return <View key={ki} style={styles.keyEmpty} />;
                        if (key === 'del') {
                          return (
                            <Pressable
                              key={ki}
                              testID="pin-delete"
                              style={({ pressed }) => [styles.key, { backgroundColor: pressed ? `${colors.purple}25` : colors.bgCardAlt }]}
                              onPress={handleDelete}
                            >
                              <Ionicons name="backspace-outline" size={22} color={colors.textPrimary} />
                            </Pressable>
                          );
                        }
                        return (
                          <Pressable
                            key={ki}
                            testID={`pin-key-${key}`}
                            style={({ pressed }) => [styles.key, { backgroundColor: pressed ? `${colors.purple}25` : colors.bgCardAlt }]}
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

                <Pressable
                  style={[styles.backBtn, { backgroundColor: `${colors.border}80` }]}
                  onPress={() => { setStage('form'); setPin(''); setPinError(''); }}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                  <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {result && (
        <ResultModal
          visible={!!result}
          type={result.type}
          title={result.title}
          message={result.message}
          onClose={() => { setResult(null); handleClose(); }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, maxHeight: '90%' },
  handle: { width: 40, height: 4, borderRadius: 2, marginTop: 12, marginBottom: 20, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  sheetSub: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 20 },
  scroll: { flex: 1 },
  form: { gap: 18, paddingBottom: 24 },
  pinView: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  lockIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  pinTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  pinSub: { fontSize: 13, fontFamily: 'Nunito_400Regular' },
  dotsRow: { flexDirection: 'row', gap: 20, marginVertical: 8 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  pinError: { fontSize: 13, fontFamily: 'Nunito_500Medium' },
  pinHint: { fontSize: 12, fontFamily: 'Nunito_400Regular', marginBottom: 8 },
  keypad: { width: '100%', gap: 10 },
  keyRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  key: { width: 88, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { width: 88, height: 60 },
  keyText: { fontSize: 24, fontFamily: 'Nunito_600SemiBold' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 8 },
  backText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
});
