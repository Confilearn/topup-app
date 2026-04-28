import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useWalletStore } from "@/store/walletStore";
import { useTransactionStore } from "@/store/transactionStore";

interface ElectricityModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ElectricityModal({ visible, onClose }: ElectricityModalProps) {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();
  const { electricityServices, purchaseElectricity } = useVtuStore();

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedService || !meterNumber || !amount || balance < total) return;

    try {
      // Call the VTU API to purchase electricity
      await purchaseElectricity({
        meterNumber,
        amount: Number(amount),
        provider: selectedService.description,
        reference: `ELEC-${Date.now()}`,
      });

      // Update local state
      deductBalance(total);
      addTransaction({
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: "1", // TODO: Get actual user ID from auth store
        type: "electricity",
        amount: total,
        feeAmount: fee,
        status: "completed",
        reference: `ELEC-${Date.now()}`,
        fullName: "User", // TODO: Get actual user name
        createdAt: new Date().toISOString(),
        details: {
          meterNum: meterNumber,
          disco: selectedService.description,
        },
      });
    } catch (error) {
      console.error("Electricity purchase failed:", error);
      throw error; // Re-throw to let ServiceSheetModal handle it
    }

    setMeterNumber("");
    setAmount("");
    setSelectedService(null);
  };

  const handleClose = () => {
    setMeterNumber("");
    setAmount("");
    setSelectedService(null);
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Electricity Bills"
      subtitle="Pay for EKEDC, IKEDC, PHEDC & more"
      proceedLabel={
        selectedService && amount
          ? `Pay ₦${total.toLocaleString()} for ${selectedService.description}`
          : "Select Provider & Enter Amount"
      }
      proceedDisabled={!meterNumber || !amount}
      onProceed={() => !!(meterNumber && amount)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Provider
            </Text>
            <View style={styles.chipRow}>
              {electricityServices.length > 0 ? (
                electricityServices.map((service) => (
                  <Pressable
                    key={service.serviceID}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.bgCardAlt,
                        borderColor: colors.border,
                      },
                      selectedService?.serviceID === service.serviceID && {
                        backgroundColor: `${colors.purple}25`,
                        borderColor: colors.purple,
                      },
                    ]}
                    onPress={() => setSelectedService(service)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            selectedService?.serviceID === service.serviceID
                              ? colors.purpleLight
                              : colors.textMuted,
                        },
                      ]}
                    >
                      {service.description}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text
                  style={[styles.noServicesText, { color: colors.textMuted }]}
                >
                  No electricity providers available
                </Text>
              )}
            </View>
          </View>

          <Input
            label="Meter Number"
            placeholder="Enter meter number"
            value={meterNumber}
            onChangeText={setMeterNumber}
            keyboardType="number-pad"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Quick Amounts (₦)
            </Text>
            <View style={styles.chipRow}>
              {[500, 1000, 2000, 5000, 10000, 20000].map((a) => (
                <Pressable
                  key={a}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.bgCardAlt,
                      borderColor: colors.border,
                    },
                    amount === String(a) && {
                      backgroundColor: `${colors.purple}25`,
                      borderColor: colors.purple,
                    },
                  ]}
                  onPress={() => setAmount(String(a))}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          amount === String(a)
                            ? colors.purpleLight
                            : colors.textMuted,
                      },
                    ]}
                  >
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
          ) : null}
        </>
      )}
    </ServiceSheetModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: "Nunito_600SemiBold", marginBottom: 8 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
  noServicesText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    padding: 20,
  },
});
