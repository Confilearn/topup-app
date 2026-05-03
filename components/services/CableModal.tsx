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

interface CableModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * CableModal - Dynamic cable TV subscription modal
 * Uses store data and server-provided markup percentages
 * Implements proper transaction tracking and error handling
 */
export function CableModal({ visible, onClose }: CableModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedProvider, setSelectedProvider] = useState<VtuService | null>(
    null,
  );
  const [selectedPlan, setSelectedPlan] = useState<VtuService | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [transactionReference, setTransactionReference] = useState<
    string | null
  >(null);

  const { addTransaction } = useTransactionStore();
  const { cableServices, purchaseCable, isLoading } = useVtuStore();

  // Derive providers dynamically from store data
  const providers = useMemo(() => {
    const uniqueProviders = Array.from(
      new Set(cableServices.map((service) => service.typeSingle)),
    ).filter(Boolean);

    return uniqueProviders.map((providerName) => {
      const service = cableServices.find((s) => s.typeSingle === providerName);
      return {
        id:
          providerName?.toLowerCase().replace(/\s+/g, "-") ||
          service?.serviceID,
        name: providerName || service?.serviceID || "",
        description: service?.description || `${providerName} Cable TV`,
        serviceID: service?.serviceID,
        provider: providerName,
        markupPercentage: service?.markupPercentage || 0,
      };
    });
  }, [cableServices]);

  // Filter plans based on selected provider
  const availablePlans = useMemo(() => {
    if (!selectedProvider) return [];

    return cableServices.filter(
      (service) => service.typeSingle === selectedProvider.provider,
    );
  }, [selectedProvider, cableServices]);

  // Calculate markup using server-provided percentage
  const calculateTotalWithMarkup = (
    originalAmount: number,
    markupPercentage: number,
  ) => {
    return markupPercentage > 0
      ? originalAmount * (1 + markupPercentage / 100)
      : originalAmount;
  };

  // Calculate fee and total using proper markup from selected plan
  const fee = useMemo(() => {
    if (!selectedPlan) return 0;
    const originalAmount = parseFloat(
      selectedPlan.originalAmount || selectedPlan.amount || "0",
    );
    const markedUpAmount = parseFloat(selectedPlan.amount || "0");
    return Math.round(markedUpAmount - originalAmount);
  }, [selectedPlan]);

  const total = useMemo(() => {
    if (!selectedPlan) return 0;
    return parseFloat(selectedPlan.amount || "0");
  }, [selectedPlan]);

  /**
   * Handle cable subscription with proper transaction tracking
   * Uses server-provided markup and generates unique reference
   */
  const handleConfirmed = async () => {
    if (!selectedProvider || !selectedPlan || !smartCardNumber) return;

    // Generate unique transaction reference
    const reference = `CABLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionReference(reference);

    try {
      // Call VTU API with proper payload structure
      const response = await purchaseCable({
        serviceID: selectedPlan.serviceID,
        amount: parseFloat(selectedPlan.amount), // Marked-up amount
        originalAmount: parseFloat(
          selectedPlan.originalAmount || selectedPlan.amount,
        ), // Original amount
        cableNum: smartCardNumber,
        plan: selectedPlan.description,
        provider: selectedProvider.provider,
        reference,
      });

      // Add transaction to local store with proper status tracking
      const transaction = {
        _id: reference,
        userId: user?.id || "unknown",
        type: "cable" as const,
        amount: total, // Amount charged to user
        originalAmount: parseFloat(
          selectedPlan.originalAmount || selectedPlan.amount,
        ), // Original plan amount
        feeAmount: fee, // Service fee
        status: "pending" as const, // Start as pending, update based on server response
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          cableNum: smartCardNumber,
          provider: selectedProvider.provider,
          plan: selectedPlan.description,
          serviceID: selectedPlan.serviceID,
          markupPercentage: selectedPlan.markupPercentage || 0,
        },
      };

      addTransaction(transaction);

      // Reset form on successful submission
      setSmartCardNumber("");
      setSelectedPlan(null);
      setSelectedProvider(null);
      setTransactionReference(null);
    } catch (error: any) {
      console.error("Cable subscription failed:", error);

      // Add failed transaction for tracking
      addTransaction({
        _id: reference,
        userId: user?.id || "unknown",
        type: "cable" as const,
        amount: total,
        feeAmount: fee,
        status: "failed" as const,
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          cableNum: smartCardNumber,
          provider: selectedProvider?.provider,
          plan: selectedPlan?.description,
          serviceID: selectedPlan?.serviceID,
          markupPercentage: selectedPlan?.markupPercentage || 0,
          error: error.message || "Subscription failed",
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
    setSmartCardNumber("");
    setSelectedPlan(null);
    setSelectedProvider(null);
    setTransactionReference(null);
    setShowProviderDropdown(false);
    setShowPlanDropdown(false);
    onClose();
  };

  /**
   * Handle provider selection with proper state reset
   */
  const handleProviderChange = (provider: any) => {
    setSelectedProvider(provider);
    setSelectedPlan(null);
    setShowProviderDropdown(false);
  };

  const handlePlanChange = (plan: VtuService) => {
    setSelectedPlan(plan);
    setShowPlanDropdown(false);
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Cable TV"
      subtitle="Renew your cable TV subscription"
      proceedLabel={
        selectedPlan
          ? `Subscribe ${selectedPlan.description} for ₦${total.toLocaleString()}`
          : "Select Provider & Plan"
      }
      proceedDisabled={
        !selectedProvider || !selectedPlan || !smartCardNumber || isLoading
      }
      onProceed={() => !!(selectedProvider && selectedPlan && smartCardNumber)}
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
                    color: selectedProvider
                      ? colors.textPrimary
                      : colors.textMuted,
                  },
                ]}
              >
                {selectedProvider
                  ? selectedProvider.provider || selectedProvider.name
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
                    onPress={() => handleProviderChange(provider)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {provider.provider || provider.name}
                    </Text>
                    {selectedProvider?.serviceID === provider.serviceID && (
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
            label="Smart Card Number"
            placeholder="Enter smart card number"
            value={smartCardNumber}
            onChangeText={setSmartCardNumber}
            keyboardType="number-pad"
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Select Package
            </Text>
            <Pressable
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowPlanDropdown(!showPlanDropdown)}
              disabled={!selectedProvider}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: selectedPlan ? colors.textPrimary : colors.textMuted,
                  },
                ]}
              >
                {selectedPlan ? selectedPlan.description : "Select Package"}
              </Text>
              <Ionicons
                name={showPlanDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showPlanDropdown && selectedProvider && (
              <View
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {availablePlans.map((plan) => (
                  <Pressable
                    key={plan.serviceID}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => handlePlanChange(plan)}
                  >
                    <View style={styles.planContainer}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {plan.description}
                      </Text>
                      <View style={styles.planPricing}>
                        {plan.originalAmount &&
                          plan.originalAmount !== plan.amount && (
                            <Text
                              style={[
                                styles.originalPrice,
                                { color: colors.textMuted },
                              ]}
                            >
                              ₦
                              {parseFloat(plan.originalAmount).toLocaleString()}
                            </Text>
                          )}
                        <Text
                          style={[
                            styles.currentPrice,
                            { color: colors.textPrimary },
                          ]}
                        >
                          ₦{parseFloat(plan.amount).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    {selectedPlan?.serviceID === plan.serviceID && (
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

          {selectedPlan && (
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
                {selectedPlan.markupPercentage
                  ? `${selectedPlan.markupPercentage}% service fee: ₦${fee} · Total: ₦${total.toLocaleString()}`
                  : `Service fee: ₦${fee} · Total: ₦${total.toLocaleString()}`}
              </Text>
              {selectedPlan.originalAmount &&
                selectedPlan.originalAmount !== selectedPlan.amount && (
                  <Text
                    style={[
                      styles.originalAmountText,
                      { color: colors.textMuted },
                    ]}
                  >
                    Original price: ₦
                    {parseFloat(selectedPlan.originalAmount).toLocaleString()}
                  </Text>
                )}
            </View>
          )}
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
});
