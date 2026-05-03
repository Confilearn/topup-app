import React, { useState, useMemo, useEffect } from "react";
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

interface DataModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * DataModal - Dynamic data bundle purchase modal
 * Uses store data instead of hardcoded values for better maintainability
 * Implements proper markup calculation and transaction tracking
 */
export function DataModal({ visible, onClose }: DataModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedNetwork, setSelectedNetwork] = useState<VtuService | null>(
    null,
  );
  const [phone, setPhone] = useState("");
  const [dataType, setDataType] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<VtuService | null>(null);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showDataTypeDropdown, setShowDataTypeDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [transactionReference, setTransactionReference] = useState<
    string | null
  >(null);

  const { addTransaction } = useTransactionStore();
  const { dataServices, purchaseData, isLoading } = useVtuStore();
  const { startPolling } = useTransactionPolling({ enabled: true });

  // Debug: Log data services
  console.log(
    "🔍 DataModal - dataServices:",
    dataServices.length,
    dataServices.slice(0, 2),
  );

  // Derive networks dynamically from store data
  const networks = useMemo(() => {
    const uniqueNetworks = Array.from(
      new Set(dataServices.map((service) => service.network)),
    ).filter(Boolean);

    return uniqueNetworks.map((networkName) => {
      const service = dataServices.find((s) => s.network === networkName);
      return {
        id: networkName?.toLowerCase(),
        name: networkName?.toUpperCase() || "",
        description: service?.description || `${networkName} Data Services`,
        serviceID: service?.serviceID,
        network: networkName,
        markupPercentage: service?.markupPercentage || 0,
      };
    });
  }, [dataServices]);

  // Derive data types dynamically from store data
  const dataTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(dataServices.map((service) => service.dataType || "")),
    ).filter(Boolean);

    return uniqueTypes.map((type) => ({
      id: type?.toLowerCase() || "",
      name:
        type?.charAt(0)?.toUpperCase() + type?.slice(1)?.toLowerCase() || "",
    }));
  }, [dataServices]);

  // Filter plans based on selected network and data type
  const availablePlans = useMemo(() => {
    if (!selectedNetwork || !dataType) return [];

    return dataServices.filter(
      (service) =>
        service.network === selectedNetwork?.network &&
        service.dataType?.toLowerCase() === dataType.toLowerCase(),
    );
  }, [selectedNetwork, dataType, dataServices]);

  // Calculate markup using server-provided percentage
  const calculateMarkup = (
    originalAmount: number,
    markupPercentage: number,
  ) => {
    return markupPercentage > 0
      ? originalAmount * (1 + markupPercentage / 100)
      : originalAmount;
  };

  // Calculate fee and total using proper markup
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
   * Handle data purchase with proper transaction tracking
   * Uses server-provided markup and generates unique reference
   */
  const handleConfirmed = async () => {
    if (!selectedNetwork || !phone || !dataType || !selectedPlan) return;

    // Generate unique transaction reference
    const reference = `DATA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionReference(reference);

    try {
      // Call VTU API with proper payload structure
      const response = await purchaseData({
        serviceID: selectedPlan.serviceID,
        mobileNumber: phone,
        network: selectedNetwork.network,
        plan:
          selectedPlan.description ||
          `${selectedNetwork.network} ${selectedPlan.description}`,
        amount: parseFloat(selectedPlan.amount), // Marked-up amount
        originalAmount: parseFloat(
          selectedPlan.originalAmount || selectedPlan.amount,
        ), // Original amount
        reference,
      });

      // Add transaction to local store with proper status tracking
      const transaction = {
        _id: reference,
        userId: user?.id || "unknown",
        type: "data" as const,
        amount: total, // Marked-up amount charged to user
        originalAmount: parseFloat(
          selectedPlan.originalAmount || selectedPlan.amount,
        ), // Original service amount
        feeAmount: fee, // Service fee
        status: "pending" as const, // Start as pending, update based on server response
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedNetwork.network,
          dataPlan: selectedPlan.description,
          dataType,
          serviceID: selectedPlan.serviceID,
          markupPercentage: selectedPlan.markupPercentage || 0,
        },
      };

      addTransaction(transaction);

      // Start polling for transaction status updates
      startPolling(reference);

      // Reset form on successful submission
      setPhone("");
      setSelectedNetwork(null);
      setDataType("");
      setSelectedPlan(null);
      setTransactionReference(null);
    } catch (error: any) {
      console.error("Data purchase failed:", error);

      // Add failed transaction for tracking
      addTransaction({
        _id: reference,
        userId: user?.id || "unknown",
        type: "data" as const,
        amount: total,
        feeAmount: fee,
        status: "failed" as const,
        reference,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedNetwork?.network,
          dataPlan: selectedPlan?.description,
          dataType,
          serviceID: selectedPlan?.serviceID,
          markupPercentage: selectedPlan?.markupPercentage || 0,
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
    setSelectedNetwork(null);
    setDataType("");
    setSelectedPlan(null);
    setTransactionReference(null);
    setShowNetworkDropdown(false);
    setShowDataTypeDropdown(false);
    setShowPlanDropdown(false);
    onClose();
  };

  /**
   * Reset dependent fields when parent selection changes
   */
  const handleNetworkChange = (network: any) => {
    setSelectedNetwork(network);
    setDataType("");
    setSelectedPlan(null);
    setShowNetworkDropdown(false);
  };

  const handleDataTypeChange = (type: any) => {
    setDataType(type.id);
    setSelectedPlan(null);
    setShowDataTypeDropdown(false);
  };

  const handlePlanChange = (plan: VtuService) => {
    setSelectedPlan(plan);
    setShowPlanDropdown(false);
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Data Bundles"
      subtitle="Purchase data plans for all networks"
      proceedLabel={
        selectedNetwork && dataType && selectedPlan
          ? `Purchase ${selectedPlan.description} for ₦${total.toLocaleString()}`
          : "Select Network & Plan"
      }
      proceedDisabled={
        !selectedNetwork || !phone || !dataType || !selectedPlan || isLoading
      }
      onProceed={() => !!(selectedNetwork && phone && dataType && selectedPlan)}
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
                    color: selectedNetwork
                      ? colors.textPrimary
                      : colors.textMuted,
                  },
                ]}
              >
                {selectedNetwork?.network?.toUpperCase() || "Select Network"}
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
                    onPress={() => handleNetworkChange(network)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {network.name}
                    </Text>
                    {selectedNetwork?.serviceID === network.serviceID && (
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
          />

          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Data Type
            </Text>
            <Pressable
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDataTypeDropdown(!showDataTypeDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: dataType ? colors.textPrimary : colors.textMuted,
                  },
                ]}
              >
                {dataType
                  ? dataTypes.find((t) => t.id === dataType)?.name
                  : "Select Data Type"}
              </Text>
              <Ionicons
                name={showDataTypeDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showDataTypeDropdown && (
              <View
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {dataTypes.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => handleDataTypeChange(type)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {type.name}
                    </Text>
                    {dataType === type.id && (
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
              Data Plan
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
              disabled={!selectedNetwork}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: selectedPlan ? colors.textPrimary : colors.textMuted,
                  },
                ]}
              >
                {selectedPlan
                  ? `${selectedNetwork?.network?.toUpperCase() || ""} ${selectedPlan?.description || ""} - N${total.toLocaleString()} ${selectedPlan.validity ? `(${selectedPlan.validity})` : ""}`
                  : "Select Data Plan"}
              </Text>
              <Ionicons
                name={showPlanDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {showPlanDropdown && selectedNetwork && (
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
                      {plan.validity && (
                        <Text
                          style={[
                            styles.planValidity,
                            { color: colors.textMuted },
                          ]}
                        >
                          {plan.validity}
                        </Text>
                      )}
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
  planValidity: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
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
