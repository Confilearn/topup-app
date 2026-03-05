import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useTheme';

interface ResultModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

export function ResultModal({ visible, type, title, message, onClose }: ResultModalProps) {
  const colors = useColors();
  const isSuccess = type === 'success';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <LinearGradient
            colors={isSuccess ? ['#065F46', '#064E3B'] : ['#7F1D1D', '#450A0A']}
            style={styles.iconWrap}
          >
            <Ionicons name={isSuccess ? 'checkmark' : 'close'} size={32} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: isSuccess ? colors.success : colors.error, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.btnText}>{isSuccess ? 'Great!' : 'Try Again'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 24, padding: 32, width: '100%', maxWidth: 360, alignItems: 'center', gap: 12, borderWidth: 1 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center' },
  message: { fontSize: 14, fontFamily: 'Nunito_400Regular', textAlign: 'center', lineHeight: 22 },
  btn: { marginTop: 8, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
});
