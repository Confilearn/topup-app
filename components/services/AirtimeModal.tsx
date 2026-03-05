import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { PinModal } from './PinModal';
import { ResultModal } from './ResultModal';
import { NETWORKS, AIRTIME_AMOUNTS } from '@/lib/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';

interface AirtimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AirtimeModal({ visible, onClose }: AirtimeModalProps) {
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleProceed = () => {
    if (!phone || !amount) return;
    setShowPin(true);
  };

  const handlePinSuccess = () => {
    setShowPin(false);
    if (balance < total) {
      setResult({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'Your wallet balance is insufficient for this transaction.',
      });
      return;
    }
    deductBalance(total);
    addTransaction({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'airtime',
      provider: network,
      amount: total,
      fee,
      status: 'completed',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      phone,
      reference: 'TXN-' + Date.now(),
      description: `${network} Airtime`,
      recipient: phone,
    });
    setResult({
      type: 'success',
      title: 'Airtime Sent!',
      message: `₦${Number(amount).toLocaleString()} airtime has been sent to ${phone} on ${network}.`,
    });
  };

  const handleClose = () => {
    setPhone('');
    setAmount('');
    setNetwork('MTN');
    onClose();
  };

  const handleResultClose = () => {
    setResult(null);
    handleClose();
  };

  return (
    <>
      <Modal visible={visible && !showPin && !result} animationType="slide" transparent onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>Airtime Top-up</Text>
              <Pressable onPress={handleClose}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.subtitle}>Complete the form below to purchase Airtime</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>Select Network</Text>
                  <View style={styles.networkRow}>
                    {NETWORKS.map((n) => (
                      <Pressable
                        key={n}
                        style={[styles.networkBtn, network === n && styles.networkBtnActive]}
                        onPress={() => setNetwork(n)}
                      >
                        <Text style={[styles.networkText, network === n && styles.networkTextActive]}>{n}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Input
                  label="Phone Number"
                  placeholder="08012345678"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <View>
                  <Text style={styles.label}>Quick Amounts</Text>
                  <View style={styles.amountGrid}>
                    {AIRTIME_AMOUNTS.map((a) => (
                      <Pressable
                        key={a}
                        style={[styles.amountBtn, amount === String(a) && styles.amountBtnActive]}
                        onPress={() => setAmount(String(a))}
                      >
                        <Text style={[styles.amountText, amount === String(a) && styles.amountTextActive]}>
                          ₦{a.toLocaleString()}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Input
                  label="Custom Amount (₦)"
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                />

                {amount ? (
                  <View style={styles.feeBox}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                    <Text style={styles.feeText}>
                      Service fee (10%): ₦{fee} | Total: ₦{total.toLocaleString()}
                    </Text>
                  </View>
                ) : null}

                <GradientButton
                  title={amount ? `Purchase ₦${Number(amount).toLocaleString()} Airtime` : 'Select Amount'}
                  onPress={handleProceed}
                  disabled={!phone || !amount}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <PinModal
        visible={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={handlePinSuccess}
      />

      {result && (
        <ResultModal
          visible={!!result}
          type={result.type}
          title={result.title}
          message={result.message}
          onClose={handleResultClose}
        />
      )}
    </>
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
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  form: {
    gap: 18,
    paddingBottom: 24,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },
  networkRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  networkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  networkBtnActive: {
    backgroundColor: `${COLORS.purple}30`,
    borderColor: COLORS.purple,
  },
  networkText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  networkTextActive: {
    color: COLORS.purpleLight,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountBtnActive: {
    backgroundColor: `${COLORS.purple}30`,
    borderColor: COLORS.purple,
  },
  amountText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  amountTextActive: {
    color: COLORS.purpleLight,
  },
  feeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: `${COLORS.warning}15`,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.warning}40`,
    alignItems: 'flex-start',
  },
  feeText: {
    color: COLORS.warning,
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    flex: 1,
  },
});
