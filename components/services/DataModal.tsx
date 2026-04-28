import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useWalletStore } from "@/store/walletStore";
import { useTransactionStore } from "@/store/transactionStore";

interface DataModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DataModal({ visible, onClose }: DataModalProps) {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();
  const { dataServices, purchaseData } = useVtuStore();

  const fee = selectedService
    ? Math.round(Number(selectedService.amount) * 0.1)
    : 0;
  const total = selectedService ? Number(selectedService.amount) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedService || !phone || balance < total) return;

    try {
      // Call the VTU API to purchase data
      await purchaseData({
        phone,
        plan: selectedService.description,
        provider: selectedService.network,
        reference: `DATA-${Date.now()}`,
      });

      // Update local state
      deductBalance(total);
      addTransaction({
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: "1", // TODO: Get actual user ID from auth store
        type: "data",
        amount: total,
        feeAmount: fee,
        status: "completed",
        reference: `DATA-${Date.now()}`,
        fullName: "User", // TODO: Get actual user name
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedService.network,
          dataPlan: selectedService.description,
        },
      });
    } catch (error) {
      console.error("Data purchase failed:", error);
      // TODO: Show error message to user
      return;
    }

    setPhone("");
    setSelectedService(null);
  };

  const handleClose = () => {
    setPhone("");
    setSelectedService(null);
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Data Bundles"
      subtitle="Purchase data plans for all networks"
      proceedLabel={
        selectedService
          ? `Purchase ${selectedService.description} for ₦${total.toLocaleString()}`
          : "Select a Plan"
      }
      proceedDisabled={!phone || !selectedService}
      onProceed={() => !!(phone && selectedService)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <Input
            label="Phone Number"
            placeholder="08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Data Plan
            </Text>
            <ScrollView style={styles.planList}>
              {dataServices.map((service) => (
                <Pressable
                  key={service.serviceID}
                  style={[
                    styles.planItem,
                    {
                      backgroundColor: colors.bgCardAlt,
                      borderColor: colors.border,
                    },
                    selectedService?.serviceID === service.serviceID && {
                      borderColor: colors.purple,
                      backgroundColor: `${colors.purple}15`,
                    },
                  ]}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={styles.planInfo}>
                    <Text
                      style={[styles.planName, { color: colors.textPrimary }]}
                    >
                      {service.description}
                    </Text>
                    <Text
                      style={[styles.planValidity, { color: colors.textMuted }]}
                    >
                      {service.network} •{" "}
                      {service.validity || "No validity info"}
                    </Text>
                    {service.originalAmount && (
                      <Text
                        style={[
                          styles.originalPrice,
                          { color: colors.textMuted },
                        ]}
                      >
                        Original: ₦{service.originalAmount}
                      </Text>
                    )}
                  </View>
                  <View style={styles.planPricing}>
                    <Text
                      style={[
                        styles.planPrice,
                        {
                          color:
                            selectedService?.serviceID === service.serviceID
                              ? colors.purpleLight
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      ₦{Number(service.amount).toLocaleString()}
                    </Text>
                    {service.markupPercentage && (
                      <Text
                        style={[styles.markupText, { color: colors.textMuted }]}
                      >
                        +{service.markupPercentage}%
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {selectedService && (
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
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  planList: { gap: 8, maxHeight: 300 },
  planItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  planInfo: { flex: 1 },
  planPricing: { alignItems: "flex-end" },
  planName: { fontSize: 14, fontFamily: "Nunito_600SemiBold", marginBottom: 2 },
  planValidity: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textDecorationLine: "line-through",
  },
  planPrice: { fontSize: 15, fontFamily: "Nunito_700Bold", marginBottom: 2 },
  markupText: { fontSize: 10, fontFamily: "Nunito_400Regular" },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
});
