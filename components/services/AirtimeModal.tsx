import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { ServiceSheetModal } from './ServiceSheetModal';
import { NETWORKS, AIRTIME_AMOUNTS } from '@/lib/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';

interface AirtimeModalProps { visible: boolean; onClose: () => void; }

export function AirtimeModal({ visible, onClose }: AirtimeModalProps) {
  const colors = useColors();
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleConfirmed = () => {
    if (balance < total) return;
    deductBalance(total);
    addTransaction({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'airtime', provider: network, amount: total, fee, status: 'completed',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      phone, reference: 'TXN-' + Date.now(), description: `${network} Airtime`, recipient: phone,
    });
    setPhone('');
    setAmount('');
    setNetwork('MTN');
  };

  const handleClose = () => { setPhone(''); setAmount(''); setNetwork('MTN'); onClose(); };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Airtime Top-up"
      subtitle="Complete the form below to purchase Airtime"
      proceedLabel={amount ? `Purchase ₦${Number(amount).toLocaleString()} Airtime` : 'Select Amount'}
      proceedDisabled={!phone || !amount}
      onProceed={() => !!(phone && amount)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Select Network</Text>
            <View style={styles.chipRow}>
              {NETWORKS.map((n) => (
                <Pressable key={n} style={[styles.chip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }, network === n && { backgroundColor: `${colors.purple}25`, borderColor: colors.purple }]} onPress={() => setNetwork(n)}>
                  <Text style={[styles.chipText, { color: network === n ? colors.purpleLight : colors.textMuted }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input label="Phone Number" placeholder="08012345678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="phone-input" />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Quick Amounts</Text>
            <View style={styles.chipRow}>
              {AIRTIME_AMOUNTS.map((a) => (
                <Pressable key={a} style={[styles.chip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }, amount === String(a) && { backgroundColor: `${colors.purple}25`, borderColor: colors.purple }]} onPress={() => setAmount(String(a))}>
                  <Text style={[styles.chipText, { color: amount === String(a) ? colors.purpleLight : colors.textMuted }]}>₦{a.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input label="Custom Amount (₦)" placeholder="Enter amount" value={amount} onChangeText={setAmount} keyboardType="number-pad" />

          {amount ? (
            <View style={[styles.feeBox, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}30` }]}>
              <Text style={[styles.feeText, { color: colors.warning }]}>10% fee: ₦{fee} · Total: ₦{total.toLocaleString()}</Text>
            </View>
          ) : null}
        </>
      )}
    </ServiceSheetModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  feeBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  feeText: { fontSize: 12, fontFamily: 'Nunito_500Medium', flex: 1 },
});
