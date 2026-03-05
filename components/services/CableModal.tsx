import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { PinModal } from './PinModal';
import { ResultModal } from './ResultModal';
import { CABLE_PROVIDERS, CABLE_PLANS } from '@/lib/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';

interface CableModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CableModal({ visible, onClose }: CableModalProps) {
  const [provider, setProvider] = useState('DSTV');
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();
  const plans = CABLE_PLANS[provider] || [];
  const plan = plans[selectedPlan];
  const fee = plan ? Math.round(plan.amount * 0.1) : 0;
  const total = plan ? plan.amount + fee : 0;

  const handleProceed = () => { if (!smartCardNumber || !plan) return; setShowPin(true); };
  const handlePinSuccess = () => {
    setShowPin(false);
    if (balance < total) { setResult({ type: 'error', title: 'Insufficient Balance', message: 'Insufficient wallet balance.' }); return; }
    deductBalance(total);
    addTransaction({ id: Date.now().toString() + Math.random().toString(36).substr(2, 9), type: 'cable', provider, amount: total, fee, status: 'completed', date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString(), reference: 'TXN-' + Date.now(), description: `${provider} ${plan.label}`, recipient: smartCardNumber });
    setResult({ type: 'success', title: 'Subscription Successful!', message: `${provider} ${plan.label} subscription activated.` });
  };
  const handleClose = () => { setSmartCardNumber(''); setSelectedPlan(0); setProvider('DSTV'); onClose(); };
  const handleResultClose = () => { setResult(null); handleClose(); };

  return (
    <>
      <Modal visible={visible && !showPin && !result} animationType="slide" transparent onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>Cable TV</Text>
              <Pressable onPress={handleClose}><Ionicons name="close" size={24} color={COLORS.textMuted} /></Pressable>
            </View>
            <Text style={styles.subtitle}>Renew your cable TV subscription</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>Select Provider</Text>
                  <View style={styles.provRow}>
                    {CABLE_PROVIDERS.map((p) => (
                      <Pressable key={p} style={[styles.provBtn, provider === p && styles.provBtnActive]} onPress={() => { setProvider(p); setSelectedPlan(0); }}>
                        <Text style={[styles.provText, provider === p && styles.provTextActive]}>{p}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Input label="Smart Card / IUC Number" placeholder="Enter smart card number" value={smartCardNumber} onChangeText={setSmartCardNumber} keyboardType="number-pad" />
                <View>
                  <Text style={styles.label}>Select Plan</Text>
                  <View style={styles.planList}>
                    {plans.map((p, i) => (
                      <Pressable key={i} style={[styles.planItem, selectedPlan === i && styles.planItemActive]} onPress={() => setSelectedPlan(i)}>
                        <Text style={styles.planName}>{p.label}</Text>
                        <Text style={[styles.planPrice, selectedPlan === i && { color: COLORS.purpleLight }]}>₦{p.amount.toLocaleString()}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                {plan && (
                  <View style={styles.feeBox}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                    <Text style={styles.feeText}>10% service fee: ₦{fee} | Total: ₦{total.toLocaleString()}</Text>
                  </View>
                )}
                <GradientButton title={plan ? `Subscribe for ₦${total.toLocaleString()}` : 'Select a Plan'} onPress={handleProceed} disabled={!smartCardNumber || !plan} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <PinModal visible={showPin} onClose={() => setShowPin(false)} onSuccess={handlePinSuccess} />
      {result && <ResultModal visible={!!result} type={result.type} title={result.title} message={result.message} onClose={handleResultClose} />}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.bgSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 12, marginBottom: 20, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Nunito_700Bold' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 20 },
  form: { gap: 18, paddingBottom: 24 },
  label: { color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Nunito_600SemiBold', marginBottom: 8 },
  provRow: { flexDirection: 'row', gap: 8 },
  provBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  provBtnActive: { backgroundColor: `${COLORS.purple}30`, borderColor: COLORS.purple },
  provText: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  provTextActive: { color: COLORS.purpleLight },
  planList: { gap: 8 },
  planItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  planItemActive: { borderColor: COLORS.purple, backgroundColor: `${COLORS.purple}15` },
  planName: { color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  planPrice: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  feeBox: { flexDirection: 'row', gap: 8, backgroundColor: `${COLORS.warning}15`, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: `${COLORS.warning}40`, alignItems: 'flex-start' },
  feeText: { color: COLORS.warning, fontSize: 12, fontFamily: 'Nunito_500Medium', flex: 1 },
});
