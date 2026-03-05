import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { ServiceSheetModal } from './ServiceSheetModal';
import { NETWORKS, DATA_PLANS } from '@/lib/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';

interface DataModalProps { visible: boolean; onClose: () => void; }

export function DataModal({ visible, onClose }: DataModalProps) {
  const colors = useColors();
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(0);
  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  const plans = DATA_PLANS[network] || [];
  const plan = plans[selectedPlan];
  const fee = plan ? Math.round(plan.amount * 0.1) : 0;
  const total = plan ? plan.amount + fee : 0;

  const handleConfirmed = () => {
    if (balance < total || !plan) return;
    deductBalance(total);
    addTransaction({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'data', provider: network, amount: total, fee, status: 'completed',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString(),
      phone, reference: 'TXN-' + Date.now(), description: `${network} ${plan.label}`, recipient: phone,
    });
    setPhone('');
    setSelectedPlan(0);
    setNetwork('MTN');
  };

  const handleClose = () => { setPhone(''); setSelectedPlan(0); setNetwork('MTN'); onClose(); };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Data Bundles"
      subtitle="Purchase data plans for all networks"
      proceedLabel={plan ? `Purchase ${plan.label} for ₦${total.toLocaleString()}` : 'Select a Plan'}
      proceedDisabled={!phone || !plan}
      onProceed={() => !!(phone && plan)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Select Network</Text>
            <View style={styles.chipRow}>
              {NETWORKS.map((n) => (
                <Pressable key={n} style={[styles.chip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }, network === n && { backgroundColor: `${colors.purple}25`, borderColor: colors.purple }]} onPress={() => { setNetwork(n); setSelectedPlan(0); }}>
                  <Text style={[styles.chipText, { color: network === n ? colors.purpleLight : colors.textMuted }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input label="Phone Number" placeholder="08012345678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Select Data Plan</Text>
            <View style={styles.planList}>
              {plans.map((p, i) => (
                <Pressable key={i} style={[styles.planItem, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }, selectedPlan === i && { borderColor: colors.purple, backgroundColor: `${colors.purple}15` }]} onPress={() => setSelectedPlan(i)}>
                  <View>
                    <Text style={[styles.planName, { color: colors.textPrimary }]}>{p.label}</Text>
                    <Text style={[styles.planValidity, { color: colors.textMuted }]}>{p.validity}</Text>
                  </View>
                  <Text style={[styles.planPrice, { color: selectedPlan === i ? colors.purpleLight : colors.textPrimary }]}>₦{p.amount.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {plan && (
            <View style={[styles.feeBox, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}30` }]}>
              <Text style={[styles.feeText, { color: colors.warning }]}>10% fee: ₦{fee} · Total: ₦{total.toLocaleString()}</Text>
            </View>
          )}
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
  planList: { gap: 8 },
  planItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  planName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  planValidity: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  planPrice: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
});
