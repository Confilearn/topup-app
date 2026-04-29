import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ServiceSheetModal } from "./ServiceSheetModal";
import { useVtuStore } from "@/store/vtu-store";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";

interface DataModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DataModal({ visible, onClose }: DataModalProps) {
  const colors = useColors();
  const { user } = useAuthStore();
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [dataType, setDataType] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showDataTypeDropdown, setShowDataTypeDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const { addTransaction } = useTransactionStore();
  const { dataServices, purchaseData } = useVtuStore();

  // Define networks
  const networks = [
    { id: "mtn", name: "MTN", description: "MTN Nigeria" },
    { id: "glo", name: "Glo", description: "Globacom" },
    { id: "airtel", name: "Airtel", description: "Airtel Nigeria" },
    { id: "9mobile", name: "9mobile", description: "9mobile" },
  ];

  // Define data types
  const dataTypes = [
    { id: "sme", name: "SME Data" },
    { id: "gifting", name: "Gifting Data" },
    { id: "corporate", name: "Corporate Data" },
    { id: "normal", name: "Normal Data" },
  ];

  // Define data plans for each network
  const dataPlans = {
    mtn: [
      { id: "mtn_500mb", size: "500MB", price: 365, validity: "30 Days" },
      { id: "mtn_1gb", size: "1GB", price: 550, validity: "30 Days" },
      { id: "mtn_2gb", size: "2GB", price: 1100, validity: "30 Days" },
      { id: "mtn_3gb", size: "3GB", price: 1650, validity: "30 Days" },
      { id: "mtn_5gb", size: "5GB", price: 2750, validity: "30 Days" },
      { id: "mtn_10gb", size: "10GB", price: 5500, validity: "30 Days" },
    ],
    glo: [
      { id: "glo_500mb", size: "500MB", price: 300, validity: "30 Days" },
      { id: "glo_1gb", size: "1GB", price: 500, validity: "30 Days" },
      { id: "glo_2gb", size: "2GB", price: 900, validity: "30 Days" },
      { id: "glo_3gb", size: "3GB", price: 1300, validity: "30 Days" },
      { id: "glo_5gb", size: "5GB", price: 2000, validity: "30 Days" },
      { id: "glo_10gb", size: "10GB", price: 3500, validity: "30 Days" },
    ],
    airtel: [
      { id: "airtel_500mb", size: "500MB", price: 350, validity: "30 Days" },
      { id: "airtel_1gb", size: "1GB", price: 600, validity: "30 Days" },
      { id: "airtel_2gb", size: "2GB", price: 1200, validity: "30 Days" },
      { id: "airtel_3gb", size: "3GB", price: 1800, validity: "30 Days" },
      { id: "airtel_5gb", size: "5GB", price: 3000, validity: "30 Days" },
      { id: "airtel_10gb", size: "10GB", price: 6000, validity: "30 Days" },
    ],
    "9mobile": [
      { id: "9mobile_500mb", size: "500MB", price: 320, validity: "30 Days" },
      { id: "9mobile_1gb", size: "1GB", price: 550, validity: "30 Days" },
      { id: "9mobile_2gb", size: "2GB", price: 1000, validity: "30 Days" },
      { id: "9mobile_3gb", size: "3GB", price: 1500, validity: "30 Days" },
      { id: "9mobile_5gb", size: "5GB", price: 2500, validity: "30 Days" },
      { id: "9mobile_10gb", size: "10GB", price: 4500, validity: "30 Days" },
    ],
  };

  const fee = selectedPlan ? Math.round(Number(selectedPlan.price) * 0.1) : 0;
  const total = selectedPlan ? Number(selectedPlan.price) + fee : 0;

  const handleConfirmed = async () => {
    if (!selectedNetwork || !phone || !dataType || !selectedPlan) return;

    try {
      // Call VTU API to purchase data
      await purchaseData({
        phone,
        plan: `${selectedNetwork.name} ${selectedPlan.size} - N${selectedPlan.price} (${selectedPlan.validity})`,
        serviceID: selectedNetwork.serviceID || selectedNetwork.id,
        network: selectedNetwork.network || selectedNetwork.id,
        reference: `DATA-${Date.now()}`,
      });

      // Update local state
      addTransaction({
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user?.id || "unknown",
        type: "data",
        amount: total,
        feeAmount: fee,
        status: "completed",
        reference: `DATA-${Date.now()}`,
        fullName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdAt: new Date().toISOString(),
        details: {
          mobileNumber: phone,
          network: selectedNetwork.name,
          dataPlan: `${selectedNetwork.name} ${selectedPlan.size} - N${selectedPlan.price} (${selectedPlan.validity})`,
        },
      });
    } catch (error) {
      console.error("Data purchase failed:", error);
      throw error; // Re-throw to let ServiceSheetModal handle it
    }

    setPhone("");
    setSelectedNetwork(null);
    setDataType("");
    setSelectedPlan(null);
  };

  const handleClose = () => {
    setPhone("");
    setSelectedNetwork(null);
    setDataType("");
    setSelectedPlan(null);
    onClose();
  };

  return (
    <ServiceSheetModal
      visible={visible}
      onClose={handleClose}
      title="Data Bundles"
      subtitle="Purchase data plans for all networks"
      proceedLabel={
        selectedNetwork && dataType && selectedPlan
          ? `Purchase ${selectedNetwork.name} ${selectedPlan.size} for ₦${total.toLocaleString()}`
          : "Select Network & Plan"
      }
      proceedDisabled={!selectedNetwork || !phone || !dataType || !selectedPlan}
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
                {selectedNetwork ? selectedNetwork.name : "Select Network"}
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
                      setSelectedNetwork(network);
                      setShowNetworkDropdown(false);
                      setDataType("");
                      setSelectedPlan(null);
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
                    {selectedNetwork?.id === network.id && (
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
                    onPress={() => {
                      setDataType(type.id);
                      setShowDataTypeDropdown(false);
                      setSelectedPlan(null);
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
                  ? `${selectedNetwork.name} ${selectedPlan.size} - N${selectedPlan.price} (${selectedPlan.validity})`
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
                {dataPlans[selectedNetwork.id]?.map((plan) => (
                  <Pressable
                    key={plan.id}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedPlan(plan);
                      setShowPlanDropdown(false);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {selectedNetwork.name} {plan.size} - N{plan.price}
                      </Text>
                      <Text
                        style={[
                          styles.planValidity,
                          { color: colors.textMuted },
                        ]}
                      >
                        {plan.validity}
                      </Text>
                    </View>
                    {selectedPlan?.id === plan.id && (
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
  planValidity: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },
  feeBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
});
