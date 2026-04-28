import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useWalletStore } from "@/store/walletStore";
import { useTransactionStore } from "@/store/transactionStore";

interface AirtimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AirtimeModal({ visible, onClose }: AirtimeModalProps) {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const { balance, deductBalance } = useWalletStore();
  const { addTransaction } = useTransactionStore();
  const { airtimeServices, purchaseAirtime } = useVtuStore();

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedService || !phone || balance < total) return;

    try {
      // Call the VTU API to purchase airtime
      await purchaseAirtime({
        phone,
        amount: Number(amount),
        provider: selectedService.network,
        reference: `AIR-${Date.now()}`,
      });

      // Update local state
      deductBalance(total);
      addTransaction({
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: "1", // TODO: Get actual user ID from auth store
        type: "airtime",
        amount: total,
        feeAmount: fee,
        status: "completed",
        reference: `AIR-${Date.now()}`,
        fullName: "User", // TODO: Get actual user name
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedService.network,
        },
      });
    } catch (error) {
      console.error("Airtime purchase failed:", error);
      throw error; // Re-throw to let ServiceSheetModal handle it
    }

    setPhone("");
    setAmount("");
    setSelectedService(null);
  };

  const handleClose = () => {
    setPhone("");
    setAmount("");
    setSelectedService(null);
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Airtime Top-up"
      subtitle="Complete the form below to purchase Airtime"
      proceedLabel={
        amount
          ? `Purchase ₦${Number(amount).toLocaleString()} Airtime`
          : "Select Amount"
      }
      proceedDisabled={!phone || !amount}
      onProceed={() => !!(phone && amount)}
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Network
            </Text>
            <View style={styles.chipRow}>
              {airtimeServices.length > 0 ? (
                airtimeServices.map((service) => (
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
                    onPress={() => {
                      setSelectedService(service);
                      setAmount(""); // Clear amount when switching services
                    }}
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
                  No airtime services available
                </Text>
              )}
            </View>
          </View>

          <Input
            label="Phone Number"
            placeholder="08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            testID="phone-input"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {selectedService
                ? `Enter Amount for ${selectedService.description}`
                : "Select a network first"}
            </Text>
            <Input
              label="Amount (₦)"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
            {selectedService?.discount && (
              <Text style={[styles.discountText, { color: colors.success }]}>
                Discount: {selectedService.discount}
              </Text>
            )}
          </View>

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
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  feeBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium", flex: 1 },
  discountText: { fontSize: 12, fontFamily: "Nunito_500Medium", marginTop: 4 },
  noServicesText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    padding: 20,
  },
});
