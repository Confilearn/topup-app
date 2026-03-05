import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { ServiceSheetModal } from './ServiceSheetModal';
import { ELECTRICITY_PROVIDERS } from '@/lib/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';

interface ElectricityModalProps { visible: boolean; onClose: () => void; }

export function ElectricityModal({ visible, onClose }: ElectricityModalProps) {
  const colors = useColors();
  const [provider, setProvider] = useState('EKEDC');
  const [meterNumber, setMeterNumber] = useState('');
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
      type: 'electricity', provider, amount: total, fee, status: 'completed',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString(),
      reference: 'TXN-' + Date.now(), description: `${provider} Electricity`, recipient: meterNumber,
    });
    setMeterNumber('');
    setAmount('');
    setProvider('EKEDC');
  };

  const handleClose = () => { setMeterNumber(''); setAmount(''); setProvider('EKEDC'); onClose(); };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Electricity Bills"
      subtitle="Pay for EKEDC, IKEDC, PHEDC & more"
      proceedLabel={amount ? `Pay ₦${total.toLocaleString()} for ${provider}` : 'Enter Amount'}
      proceedDisabled={!meterNumber || !amount}
      onProceed={() => !!(meterNumber && amount)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Select Provider</Text>
            <View style={styles.chipRow}>
              {ELECTRICITY_PROVIDERS.map((p) => (
                <Pressable key={p} style={[styles.chip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }, provider === p && { backgroundColor: `${colors.purple}25`, borderColor: colors.purple }]} onPress={() => setProvider(p)}>
                  <Text style={[styles.chipText, { color: provider === p ? colors.purpleLight : colors.textMuted }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input label="Meter Number" placeholder="Enter meter number" value={meterNumber} onChangeText={setMeterNumber} keyboardType="number-pad" />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Quick Amounts (₦)</Text>
            <View style={styles.chipRow}>
              {[500, 1000, 2000, 5000, 10000, 20000].map((a) => (
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
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
});
