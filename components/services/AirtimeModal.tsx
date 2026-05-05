import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { useTransactionPolling } from "@/hooks/useTransactionPolling";
import { Ionicons } from "@expo/vector-icons";
import { VtuService } from "@/store/vtu-store";

interface AirtimeModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * AirtimeModal - Dynamic airtime purchase modal
 * Uses store data and server-provided markup percentages
 * Implements proper transaction tracking and error handling
 */
export function AirtimeModal({ visible, onClose }: AirtimeModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedService, setSelectedService] = useState<VtuService | null>(
    null,
  );
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [transactionReference, setTransactionReference] = useState<
    string | null
  >(null);

  const { addTransaction } = useTransactionStore();
  const { airtimeServices, purchaseAirtime, isLoading } = useVtuStore();
  const { startPolling } = useTransactionPolling({ enabled: true });

  // Debug: Log airtime services data
  console.log(
    "🔍 AirtimeModal - airtimeServices:",
    airtimeServices.length,
    airtimeServices.slice(0, 2),
  );

  // Derive networks dynamically from store data
  const networks = useMemo(() => {
    return airtimeServices
      .filter((service) => service && (service.network || service.serviceID))
      .map((service) => ({
        id: service.network || service.serviceID || "",
        name: (service.network || service.serviceID || "").toUpperCase(),
        description:
          service.description ||
          `${service.network || service.serviceID || "Network"} Airtime`,
        serviceID: service.serviceID,
        network: service.network || service.serviceID,
        markupPercentage: service.markupPercentage || 0,
      }));
  }, [airtimeServices]);

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
    const markupPercentage = selectedService?.markupPercentage || 0;
    const totalAmount = calculateTotalWithMarkup(
      originalAmount,
      markupPercentage,
    );
    return Math.round(totalAmount - originalAmount);
  }, [amount, selectedService]);

  const total = useMemo(() => {
    if (!amount || !selectedService) return 0;
    const originalAmount = Number(amount);
    const markupPercentage = selectedService?.markupPercentage || 0;
    return calculateTotalWithMarkup(originalAmount, markupPercentage);
  }, [amount, selectedService]);

  /**
   * Handle airtime purchase with proper transaction tracking
   * Uses server-provided markup and generates unique reference
   */
  const handleConfirmed = async () => {
    if (!selectedService || !phone || !amount) return;

    // Validate phone number (must be numeric and valid Nigerian format)
    const phoneRegex = /^(0[789][01]\d{8})$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      throw new Error(
        "Please enter a valid Nigerian phone number (e.g., 08012345678)",
      );
    }

    // Validate amount (must be numeric and minimum ₦100)
    const originalAmount = Number(amount);
    if (isNaN(originalAmount) || originalAmount <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (originalAmount < 100) {
      throw new Error("Minimum airtime purchase is ₦100");
    }

    // Generate unique transaction reference
    const reference = `AIR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionReference(reference);

    const markupPercentage = selectedService?.markupPercentage || 0;
    const markedUpAmount = calculateTotalWithMarkup(
      originalAmount,
      markupPercentage,
    );

    try {
      // Call VTU API with proper payload structure
      const response = await purchaseAirtime({
        serviceID: selectedService?.serviceID || "",
        amount: markedUpAmount, // Marked-up amount to charge user
        originalAmount: originalAmount, // Original amount for API
        mobileNumber: phone,
        network: selectedService?.network || "",
        reference,
      });

      // Add transaction to local store with proper status tracking
      const transaction = {
        _id: reference,
        userId: user?.id || "unknown",
        type: "airtime" as const,
        amount: markedUpAmount, // Amount charged to user
        originalAmount: originalAmount, // Original airtime amount
        feeAmount: fee, // Service fee
        status: "pending" as const, // Start as pending, update based on server response
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedService?.network || "",
          serviceID: selectedService?.serviceID || "",
          markupPercentage: markupPercentage,
        },
      };

      addTransaction(transaction);

      // Reset form on successful submission
      setPhone("");
      setAmount("");
      setSelectedService(null);
      setTransactionReference(null);
    } catch (error: any) {
      console.error("Airtime purchase failed:", error);

      // Add failed transaction for tracking
      addTransaction({
        _id: reference,
        userId: user?.id || "unknown",
        type: "airtime" as const,
        amount: markedUpAmount,
        feeAmount: fee,
        status: "failed" as const,
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedService?.network || "",
          serviceID: selectedService?.serviceID || "",
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
    setPhone("");
    setAmount("");
    setSelectedService(null);
    setTransactionReference(null);
    setShowNetworkDropdown(false);
    onClose();
  };

  /**
   * Handle network selection with proper state reset
   */
  const handleNetworkChange = (network: any) => {
    setSelectedService(network);
    setShowNetworkDropdown(false);
    setAmount(""); // Clear amount when switching services
  };

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
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginTop: 8,
    },
    feeText: {
      fontSize: 12,
      fontFamily: "Nunito_500Medium",
      textAlign: "center",
    },
    originalAmountText: {
      fontSize: 11,
      fontFamily: "Nunito_400Regular",
      textAlign: "center",
      marginTop: 4,
    },
    noServicesContainer: {
      padding: 20,
      alignItems: "center",
    },
    noServicesText: {
      fontSize: 14,
      fontFamily: "Nunito_500Medium",
      textAlign: "center",
    },
    planContainer: {
      flex: 1,
    },
    planPricing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    originalPrice: {
      fontSize: 12,
      fontFamily: "Nunito_400Regular",
      textDecorationLine: "line-through",
    },
    currentPrice: {
      fontSize: 14,
      fontFamily: "Nunito_600SemiBold",
    },
    minimumText: {
      fontSize: 12,
      fontFamily: "Nunito_500Medium",
      textAlign: "center",
      marginTop: 4,
    },
  });

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Airtime Top-up"
      subtitle="Complete the form below to purchase Airtime"
      proceedLabel={
        amount && selectedService && total > 0
          ? `Purchase ₦${total.toLocaleString()} Airtime`
          : "Select Network & Amount"
      }
      proceedDisabled={!phone || !amount || !selectedService || isLoading}
      onProceed={() => !!(phone && amount && selectedService)}
      onConfirmed={handleConfirmed}
    >
      {(disabled) => (
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
                {selectedService
                  ? selectedService.network
                    ? selectedService.network.toUpperCase()
                    : "Unknown Network"
                  : "Select Network"}
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
                {networks.length > 0 ? (
                  networks.map((network) => (
                    <Pressable
                      key={network.id}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor: colors.border,
                        },
                      ]}
                      onPress={() => handleNetworkChange(network)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {network.network
                          ? network.network.toUpperCase()
                          : "Unknown"}
                      </Text>
                      {selectedService?.serviceID === network.serviceID && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.purple}
                        />
                      )}
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.noServicesContainer}>
                    <Text
                      style={[
                        styles.noServicesText,
                        { color: colors.textMuted },
                      ]}
                    >
                      No airtime services available
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Input
            label="Phone Number"
            placeholder="08012345678"
            value={phone}
            onChangeText={(text) => {
              // Only allow numbers and remove all other characters
              const numericValue = text.replace(/[^0-9]/g, "");
              setPhone(numericValue);
            }}
            keyboardType="phone-pad"
            testID="phone-input"
            maxLength={11} // Nigerian phone numbers are max 11 digits
          />

          <Input
            label="Amount (₦)"
            placeholder="Enter amount"
            value={amount}
            onChangeText={(text) => {
              // Only allow numbers and decimal point
              const numericValue = text.replace(/[^0-9.]/g, "");
              // Ensure only one decimal point
              const parts = numericValue.split(".");
              if (parts.length > 2) {
                setAmount(parts[0] + "." + parts.slice(1).join(""));
              } else {
                setAmount(numericValue);
              }
            }}
            keyboardType="number-pad"
          />

          {amount && selectedService ? (
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
                {selectedService?.markupPercentage
                  ? `${selectedService.markupPercentage}% service fee: ₦${fee} · Total: ₦${total.toLocaleString()}`
                  : `Service fee: ₦${fee} · Total: ₦${total.toLocaleString()}`}
              </Text>
              <Text
                style={[styles.originalAmountText, { color: colors.textMuted }]}
              >
                Airtime value: ₦{Number(amount).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </ServiceSheetModal>
  );
}
