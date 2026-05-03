import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { VtuService } from "@/store/vtu-store";

interface ElectricityModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * ElectricityModal - Dynamic electricity bill payment modal
 * Uses store data and server-provided markup percentages
 * Implements proper transaction tracking and error handling
 */
export function ElectricityModal({ visible, onClose }: ElectricityModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedService, setSelectedService] = useState<VtuService | null>(
    null,
  );
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showMeterTypeDropdown, setShowMeterTypeDropdown] = useState(false);
  const [meterType, setMeterType] = useState("");
  const [transactionReference, setTransactionReference] = useState<
    string | null
  >(null);

  const { addTransaction } = useTransactionStore();
  const { electricityServices, purchaseElectricity, isLoading } = useVtuStore();

  // Debug: Log electricity services
  console.log(
    "🔍 ElectricityModal - electricityServices:",
    electricityServices.length,
    electricityServices.slice(0, 2),
  );

  // Derive providers dynamically from store data
  const providers = useMemo(() => {
    return electricityServices.map((service) => ({
      id:
        service.description?.toLowerCase().replace(/\s+/g, "-") ||
        service.serviceID,
      name: service.description || service.serviceID || "",
      description: service.description || `${service.description} Electricity`,
      serviceID: service.serviceID,
      provider: service.description,
      markupPercentage: service.markupPercentage || 0,
    }));
  }, [electricityServices]);

  // Define meter types
  const meterTypes = [
    { id: "prepaid", name: "Prepaid", code: "01" },
    { id: "postpaid", name: "Postpaid", code: "02" },
  ];

  // Calculate markup using server-provided percentage
  const calculateTotalWithMarkup = (
    originalAmount: number,
    markupPercentage: number,
  ) => {
    return markupPercentage > 0
      ? originalAmount * (1 + markupPercentage / 100)
      : originalAmount;
  };

  // Calculate fee and total using proper markup from selected service
  const fee = useMemo(() => {
    if (!amount || !selectedService) return 0;
    const originalAmount = Number(amount);
    const markupPercentage = selectedService.markupPercentage || 0;
    const totalAmount = calculateTotalWithMarkup(
      originalAmount,
      markupPercentage,
    );
    return Math.round(totalAmount - originalAmount);
  }, [amount, selectedService]);

  const total = useMemo(() => {
    if (!amount || !selectedService) return 0;
    const originalAmount = Number(amount);
    const markupPercentage = selectedService.markupPercentage || 0;
    return calculateTotalWithMarkup(originalAmount, markupPercentage);
  }, [amount, selectedService]);

  /**
   * Handle electricity payment with proper transaction tracking
   * Uses server-provided markup and generates unique reference
   */
  const handleConfirmed = async () => {
    if (!selectedService || !meterNumber || !meterType || !amount) return;

    // Validate minimum amount for electricity (₦1,000)
    const originalAmount = Number(amount);
    if (originalAmount < 1000) {
      throw new Error("Minimum amount for electricity bills is ₦1,000");
    }

    // Generate unique transaction reference
    const reference = `ELEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionReference(reference);

    const markupPercentage = selectedService.markupPercentage || 0;
    const markedUpAmount = calculateTotalWithMarkup(
      originalAmount,
      markupPercentage,
    );
    const selectedMeterType = meterTypes.find((mt) => mt.id === meterType);

    try {
      // Call VTU API with proper payload structure
      const response = await purchaseElectricity({
        serviceID: selectedService.serviceID,
        amount: markedUpAmount, // Marked-up amount to charge user
        originalAmount: originalAmount, // Original amount for API
        meterNum: meterNumber,
        meterType: selectedMeterType?.code || meterType,
        provider: selectedService.provider,
        reference,
      });

      // Add transaction to local store with proper status tracking
      const transaction = {
        _id: reference,
        userId: user?.id || "unknown",
        type: "electricity" as const,
        amount: markedUpAmount, // Amount charged to user
        originalAmount: originalAmount, // Original electricity amount
        feeAmount: fee, // Service fee
        status: "pending" as const, // Start as pending, update based on server response
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          meterNumber: meterNumber,
          provider: selectedService.provider,
          meterType: selectedMeterType?.name || meterType,
          serviceID: selectedService.serviceID,
          markupPercentage: markupPercentage,
        },
      };

      addTransaction(transaction);

      // Reset form on successful submission
      setMeterNumber("");
      setAmount("");
      setSelectedService(null);
      setMeterType("");
      setTransactionReference(null);
    } catch (error: any) {
      console.error("Electricity purchase failed:", error);

      // Add failed transaction for tracking
      addTransaction({
        _id: reference,
        userId: user?.id || "unknown",
        type: "electricity" as const,
        amount: markedUpAmount,
        feeAmount: fee,
        status: "failed" as const,
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          meterNumber: meterNumber,
          provider: selectedService?.provider,
          meterType: selectedMeterType?.name || meterType,
          serviceID: selectedService?.serviceID,
          markupPercentage: markupPercentage,
          error: error.message || "Purchase failed",
        } as any, // Type assertion to allow error property
      });

      // Reset transaction reference on error
      setTransactionReference(null);

      // Re-throw error to let ServiceSheetModal handle display
      throw error;
    }
  };

  /**
   * Reset form state and close modal
   */
  const handleClose = () => {
    setMeterNumber("");
    setAmount("");
    setSelectedService(null);
    setMeterType("");
    setTransactionReference(null);
    setShowProviderDropdown(false);
    setShowMeterTypeDropdown(false);
    onClose();
  };

  /**
   * Handle provider selection with proper state reset
   */
  const handleProviderChange = (provider: any) => {
    // Create a VtuService-compatible object from provider data
    const vtuService: VtuService = {
      serviceID: provider.serviceID,
      amount: "0",
      originalAmount: "0",
      markupPercentage: provider.markupPercentage || 0,
      network: provider.provider,
      description: provider.description,
      isActive: true,
    };

    setSelectedService(vtuService);
    setShowProviderDropdown(false);
    setAmount(""); // Clear amount when switching providers
  };

  const handleMeterTypeChange = (type: any) => {
    setMeterType(type.id);
    setShowMeterTypeDropdown(false);
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Electricity Bills"
      subtitle="Pay for EKEDC, IKEDC, PHEDC & more"
      proceedLabel={
        selectedService && meterType && amount
          ? `Pay ${selectedService.provider || selectedService.description} Bill - ₦${total.toLocaleString()}`
          : "Select Provider & Amount"
      }
      proceedDisabled={
        !selectedService || !meterNumber || !meterType || !amount || isLoading
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
                {selectedService
                  ? selectedService.provider || selectedService.description
                  : "Select Provider"}
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
                      // Create a VtuService-compatible object from provider data
                      const vtuService: VtuService = {
                        serviceID: provider.serviceID,
                        amount: "0",
                        originalAmount: "0",
                        markupPercentage: provider.markupPercentage || 0,
                        network: provider.provider,
                        description: provider.description,
                        isActive: true,
                      };

                      setSelectedService(vtuService);
                      setShowProviderDropdown(false);
                      setAmount(""); // Clear amount when switching providers
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {provider.provider || provider.name}
                    </Text>
                    {selectedService?.serviceID === provider.serviceID && (
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
