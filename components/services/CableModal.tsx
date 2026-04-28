import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { CABLE_PROVIDERS, CABLE_PLANS } from "@/lib/mockData";
import { useTransactionStore } from "@/store/transactionStore";
import { useVtuStore } from "@/store/vtu-store";

interface CableModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CableModal({ visible, onClose }: CableModalProps) {
  const colors = useColors();
  const [provider, setProvider] = useState("DSTV");
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(0);
  const { addTransaction } = useTransactionStore();

  const plans = CABLE_PLANS[provider] || [];
  const plan = plans[selectedPlan];
  const fee = plan ? Math.round(plan.amount * 0.1) : 0;
  const total = plan ? plan.amount + fee : 0;

  const handleConfirmed = async () => {
    if (!plan) return;
    addTransaction({
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: "1", // TODO: Get actual user ID from auth store
      type: "cable",
      amount: total,
      feeAmount: fee,
      status: "completed",
      reference: "TXN-" + Date.now(),
      fullName: "User", // TODO: Get actual user name
      createdAt: new Date().toISOString(),
      details: {
        cableNum: smartCardNumber,
        provider: provider,
        plan: plan.label,
      },
    });
    setSmartCardNumber("");
    setSelectedPlan(0);
    setProvider("DSTV");
  };

  const handleClose = () => {
    setSmartCardNumber("");
    setSelectedPlan(0);
    setProvider("DSTV");
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Cable TV"
      subtitle="Renew your cable TV subscription"
      proceedLabel={
        plan ? `Subscribe for ₦${total.toLocaleString()}` : "Select a Plan"
      }
      proceedDisabled={!smartCardNumber || !plan}
      onProceed={() => !!(smartCardNumber && plan)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Provider
            </Text>
            <View style={styles.provRow}>
              {CABLE_PROVIDERS.map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.chip,
                    {
                      flex: 1,
                      alignItems: "center",
                      backgroundColor: colors.bgCardAlt,
                      borderColor: colors.border,
                    },
                    provider === p && {
                      backgroundColor: `${colors.purple}25`,
                      borderColor: colors.purple,
                    },
                  ]}
                  onPress={() => {
                    setProvider(p);
                    setSelectedPlan(0);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          provider === p
                            ? colors.purpleLight
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Smart Card / IUC Number"
            placeholder="Enter smart card number"
            value={smartCardNumber}
            onChangeText={setSmartCardNumber}
            keyboardType="number-pad"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Plan
            </Text>
            <View style={styles.planList}>
              {plans.map((p, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.planItem,
                    {
                      backgroundColor: colors.bgCardAlt,
                      borderColor: colors.border,
                    },
                    selectedPlan === i && {
                      borderColor: colors.purple,
                      backgroundColor: `${colors.purple}15`,
                    },
                  ]}
                  onPress={() => setSelectedPlan(i)}
                >
                  <Text
                    style={[styles.planName, { color: colors.textPrimary }]}
                  >
                    {p.label}
                  </Text>
                  <Text
                    style={[
                      styles.planPrice,
                      {
                        color:
                          selectedPlan === i
                            ? colors.purpleLight
                            : colors.textPrimary,
                      },
                    ]}
                  >
                    ₦{p.amount.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {plan && (
            <View
              style={[
                styles.feeBox,
                {
                  backgroundColor: `${colors.warning}12`,
                  borderColor: `${colors.warning}30`,
                },
              ]}
            >
              <Text style={[styles.feeText, { color: colors.warning }]}>
                10% fee: ₦{fee} · Total: ₦{total.toLocaleString()}
              </Text>
            </View>
          )}
        </>
      )}
    </ServiceSheetModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: "Nunito_600SemiBold", marginBottom: 8 },
  provRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  planList: { gap: 8 },
  planItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  planName: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  planPrice: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
});
