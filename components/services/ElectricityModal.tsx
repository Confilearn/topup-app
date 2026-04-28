import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useTransactionStore } from "@/store/transactionStore";
import { Ionicons } from "@expo/vector-icons";

interface ElectricityModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ElectricityModal({ visible, onClose }: ElectricityModalProps) {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showMeterTypeDropdown, setShowMeterTypeDropdown] = useState(false);
  const [meterType, setMeterType] = useState("");
  const { addTransaction } = useTransactionStore();
  const { electricityServices, purchaseElectricity } = useVtuStore();

  // Define electricity providers
  const providers = [
    { id: "ekedc", name: "EKEDC", description: "Eko Electricity" },
    { id: "ikedc", name: "IKEDC", description: "Ikeja Electricity" },
    { id: "phedc", name: "PHEDC", description: "Port Harcourt Electricity" },
    { id: "kedco", name: "KEDCO", description: "Kano Electricity" },
    { id: "aedc", name: "AEDC", description: "Abuja Electricity" },
    { id: "ibedc", name: "IBEDC", description: "Ibadan Electricity" },
  ];

  // Define meter types
  const meterTypes = [
    { id: "prepaid", name: "Prepaid" },
    { id: "postpaid", name: "Postpaid" },
  ];

  const fee = amount ? Math.round(Number(amount) * 0.1) : 0;
  const total = amount ? Number(amount) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedService || !meterNumber || !meterType || !amount) return;

    try {
      // Call the VTU API to purchase electricity
      await purchaseElectricity({
        meterNumber,
        amount: Number(amount),
        provider: selectedService.id,
        meterType,
        reference: `ELEC-${Date.now()}`,
      });

      // Update local state
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
          disco: selectedService.name,
        },
      });
    } catch (error) {
      console.error("Electricity purchase failed:", error);
      throw error; // Re-throw to let ServiceSheetModal handle it
    }

    setMeterNumber("");
    setAmount("");
    setSelectedService(null);
    setMeterType("");
  };

  const handleClose = () => {
    setMeterNumber("");
    setAmount("");
    setSelectedService(null);
    setMeterType("");
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Electricity Bills"
      subtitle="Pay for EKEDC, IKEDC, PHEDC & more"
      proceedLabel={
        selectedService && meterType && amount
          ? `Pay ₦${total.toLocaleString()} for ${selectedService.name}`
          : "Select Provider & Enter Details"
      }
      proceedDisabled={
        !selectedService || !meterNumber || !meterType || !amount
      }
      onProceed={() =>
        !!(selectedService && meterNumber && meterType && amount)
      }
      onConfirmed={handleConfirmed}
    >
      {() => (
        <>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Provider
            </Text>
            <Pressable
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowProviderDropdown(!showProviderDropdown)}
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
                {selectedService ? selectedService.name : "Select Provider"}
              </Text>
              <Ionicons
                name={showProviderDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showProviderDropdown && (
              <View
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {providers.map((provider) => (
                  <Pressable
                    key={provider.id}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedService(provider);
                      setShowProviderDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {provider.name}
                    </Text>
                    {selectedService?.id === provider.id && (
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
            label="Meter Number"
            placeholder="Enter meter number"
            value={meterNumber}
            onChangeText={setMeterNumber}
            keyboardType="number-pad"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Meter Type
            </Text>
            <Pressable
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowMeterTypeDropdown(!showMeterTypeDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: meterType ? colors.textPrimary : colors.textMuted,
                  },
                ]}
              >
                {meterType
                  ? meterType.charAt(0).toUpperCase() + meterType.slice(1)
                  : "Select Meter Type"}
              </Text>
              <Ionicons
                name={showMeterTypeDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showMeterTypeDropdown && (
              <View
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {meterTypes.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setMeterType(type.id);
                      setShowMeterTypeDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {type.name}
                    </Text>
                    {meterType === type.id && (
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

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Amount (₦)
            </Text>
            <Input
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
            <Text style={[styles.minimumText, { color: colors.warning }]}>
              Minimum purchase amount is ₦1,000
            </Text>
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
  minimumText: { fontSize: 12, fontFamily: "Nunito_400Regular", marginTop: 4 },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
});
