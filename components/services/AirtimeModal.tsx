import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";

interface AirtimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AirtimeModal({ visible, onClose }: AirtimeModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const { addTransaction } = useTransactionStore();
  const { airtimeServices, purchaseAirtime } = useVtuStore();

  // Use real airtime services from the store
  const networks = airtimeServices.map((service) => ({
    id: service.network || service.serviceID,
    name: (service.network || service.serviceID || "").toUpperCase(),
    description: service.description,
    serviceID: service.serviceID,
    network: service.network || service.serviceID,
  }));

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedService || !phone) return;

    try {
      // Call the VTU API to purchase airtime
      await purchaseAirtime({
        phone,
        amount: Number(amount),
        serviceID: selectedService.serviceID || selectedService.id,
        network: selectedService.network || selectedService.id,
        reference: `AIR-${Date.now()}`,
      });

      // Update local state
      addTransaction({
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user?.id || "unknown",
        type: "airtime",
        amount: total,
        feeAmount: fee,
        status: "completed",
        reference: `AIR-${Date.now()}`,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedService.network || selectedService.id,
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
            <Pressable
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowNetworkDropdown(!showNetworkDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: selectedService
                      ? colors.textPrimary
                      : colors.textMuted,
                  },
                ]}
              >
                {selectedService ? selectedService.name : "Select Network"}
              </Text>
              <Ionicons
                name={showNetworkDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showNetworkDropdown && (
              <View
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {networks.map((network) => (
                  <Pressable
                    key={network.id}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedService(network);
                      setShowNetworkDropdown(false);
                      setAmount(""); // Clear amount when switching services
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {network.name}
                    </Text>
                    {selectedService?.id === network.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.purple}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Input
            label="Phone Number"
            placeholder="08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            testID="phone-input"
          />

          <Input
            label="Amount (₦)"
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownText: { fontSize: 16, fontFamily: "Nunito_400Regular" },
  dropdownList: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 16, fontFamily: "Nunito_400Regular" },
  feeBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium", flex: 1 },
});
