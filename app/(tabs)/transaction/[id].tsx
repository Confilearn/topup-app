import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clipboard } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { useTransactionStore, Transaction } from "@/store/transactionStore";
import { AppHeader } from "@/components/ui/AppHeader";
import { GradientButton } from "@/components/ui/GradientButton";

/**
 * Transaction Detail Screen - Shows comprehensive transaction information
 * Follows the same pattern as web client but optimized for mobile
 * Features copy functionality, sharing, and detailed breakdown
 */
export default function TransactionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Transaction store hooks
  const { transactions, isLoading } = useTransactionStore();

  // Local state
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");

  // Find transaction from existing list (same pattern as web client)
  useEffect(() => {
    if (!transactions || !id) return;

    const foundTransaction = transactions.find((tx) => tx._id === id);
    setTransaction(foundTransaction || null);
  }, [transactions, id]);

  // Get transaction icon and color
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "airtime":
        return {
          icon: "phone-portrait-outline" as const,
          color: colors.success,
        };
      case "data":
        return { icon: "wifi-outline" as const, color: colors.blue };
      case "electricity":
        return { icon: "flash-outline" as const, color: colors.warning };
      case "cable":
        return { icon: "tv-outline" as const, color: colors.error };
      default:
        return { icon: "card-outline" as const, color: colors.success };
    }
  };

  // Get status color and text
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { color: colors.success, bgColor: `${colors.success}15` };
      case "failed":
        return { color: colors.error, bgColor: `${colors.error}15` };
      case "pending":
        return { color: colors.warning, bgColor: `${colors.warning}15` };
      default:
        return { color: colors.textMuted, bgColor: `${colors.textMuted}15` };
    }
  };

  // Copy to clipboard with haptic feedback
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await Clipboard.setString(text);
      setCopiedField(fieldName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  // Share transaction details
  const shareTransaction = async () => {
    if (!transaction) return;

    const shareContent = `Transaction Details\n==================\nType: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}\nAmount: ₦${transaction.amount.toLocaleString()}\nStatus: ${transaction.status}\nReference: ${transaction.reference}\nDate: ${new Date(transaction.createdAt).toLocaleString("en-NG")}`;

    try {
      await Share.share({
        message: shareContent,
        title: "Transaction Details",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Format transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    const { type, details } = transaction;

    switch (type) {
      case "deposit":
        return "Wallet Deposit";
      case "airtime":
        return details?.network
          ? `${details.network} Airtime`
          : "Airtime Recharge";
      case "data":
        return details?.network ? `${details.network} Data` : "Data Purchase";
      case "electricity":
        return details?.provider
          ? `${details.provider} Electricity`
          : "Electricity Bill";
      case "cable":
        return details?.provider
          ? `${details.provider} TV`
          : "Cable Subscription";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Loading state
  if (isLoading || !transaction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <Ionicons name="time-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {isLoading
              ? "Loading transaction details..."
              : "Transaction not found"}
          </Text>
          {!isLoading && (
            <Pressable
              style={[styles.backButton, { backgroundColor: colors.purple }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const { icon, color } = getTransactionIcon(transaction.type);
  const { color: statusColor, bgColor: statusBgColor } = getStatusStyle(
    transaction.status,
  );
  const description = getTransactionDescription(transaction);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppHeader />
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Transaction Details
            </Text>
            <Pressable onPress={shareTransaction} style={styles.shareButton}>
              <Ionicons
                name="share-outline"
                size={24}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
        </View>

        {/* Transaction Overview Card */}
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={styles.overviewHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: `${color}15` }]}
            >
              <Ionicons name={icon} size={32} color={color} />
            </View>
            <View style={styles.overviewInfo}>
              <Text
                style={[styles.transactionType, { color: colors.textPrimary }]}
              >
                {description}
              </Text>
              <Text
                style={[styles.transactionDate, { color: colors.textMuted }]}
              >
                {new Date(transaction.createdAt).toLocaleString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.overviewAmount}>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>
              {formatAmount(transaction.netAmount || transaction.amount)}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Basic Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Transaction ID
            </Text>
            <Pressable
              style={styles.copyRow}
              onPress={() => copyToClipboard(transaction._id, "id")}
            >
              <Text
                style={[styles.infoValue, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {transaction._id}
              </Text>
              <Ionicons
                name={copiedField === "id" ? "checkmark" : "copy-outline"}
                size={16}
                color={copiedField === "id" ? colors.success : colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Type
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {transaction.type.charAt(0).toUpperCase() +
                transaction.type.slice(1)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Amount
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {formatAmount(transaction.netAmount || transaction.amount)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Status
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Fee Breakdown */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Fee Breakdown
          </Text>

          {transaction.type === "deposit" ? (
            // Deposit fee breakdown
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Amount Deposited
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {formatAmount(transaction.amount || 0)}
                </Text>
              </View>

              {transaction.feeAmount && transaction.feeAmount > 0 && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Service Fee ({transaction.feePercentage || 0}%)
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.error }]}>
                    -{formatAmount(transaction.feeAmount)}
                  </Text>
                </View>
              )}

              <View style={[styles.divider, { borderColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: colors.textMuted,
                      fontFamily: "Nunito_600SemiBold",
                    },
                  ]}
                >
                  Amount Credited
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: colors.success, fontFamily: "Nunito_700Bold" },
                  ]}
                >
                  {formatAmount(transaction.netAmount || 0)}
                </Text>
              </View>
            </>
          ) : (
            // Service fee breakdown
            <>
              {transaction.originalAmount && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Original Price
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                  >
                    {formatAmount(transaction.originalAmount)}
                  </Text>
                </View>
              )}

              {transaction.feeAmount && transaction.feeAmount > 0 && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Service Fee ({transaction.feePercentage || 0}%)
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.error }]}>
                    +{formatAmount(transaction.feeAmount)}
                  </Text>
                </View>
              )}

              {transaction.profitAmount && transaction.profitAmount > 0 && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Service Charge ({transaction.markupPercentage || 0}%)
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.error }]}>
                    +{formatAmount(transaction.profitAmount)}
                  </Text>
                </View>
              )}

              <View style={[styles.divider, { borderColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: colors.textMuted,
                      fontFamily: "Nunito_600SemiBold",
                    },
                  ]}
                >
                  Total Charged
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: colors.error, fontFamily: "Nunito_700Bold" },
                  ]}
                >
                  {formatAmount(transaction.amount)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Service Details (for non-deposit transactions) */}
        {transaction.details && transaction.type !== "deposit" && (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Service Details
            </Text>

            {transaction.details.network && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Network
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {transaction.details.network}
                </Text>
              </View>
            )}

            {transaction.details.mobileNumber && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Phone Number
                </Text>
                <Pressable
                  style={styles.copyRow}
                  onPress={() =>
                    copyToClipboard(transaction.details!.mobileNumber!, "phone")
                  }
                >
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {transaction.details.mobileNumber}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === "phone" ? "checkmark" : "copy-outline"
                    }
                    size={16}
                    color={
                      copiedField === "phone"
                        ? colors.success
                        : colors.textMuted
                    }
                  />
                </Pressable>
              </View>
            )}

            {transaction.details.provider && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Provider
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {transaction.details.provider}
                </Text>
              </View>
            )}

            {transaction.details.meterNum && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Meter Number
                </Text>
                <Pressable
                  style={styles.copyRow}
                  onPress={() =>
                    copyToClipboard(transaction.details!.meterNum!, "meter")
                  }
                >
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {transaction.details.meterNum}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === "meter" ? "checkmark" : "copy-outline"
                    }
                    size={16}
                    color={
                      copiedField === "meter"
                        ? colors.success
                        : colors.textMuted
                    }
                  />
                </Pressable>
              </View>
            )}

            {transaction.details.cableNum && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Smart Card Number
                </Text>
                <Pressable
                  style={styles.copyRow}
                  onPress={() =>
                    copyToClipboard(transaction.details!.cableNum!, "cable")
                  }
                >
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {transaction.details.cableNum}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === "cable" ? "checkmark" : "copy-outline"
                    }
                    size={16}
                    color={
                      copiedField === "cable"
                        ? colors.success
                        : colors.textMuted
                    }
                  />
                </Pressable>
              </View>
            )}

            {transaction.details.plan && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Plan
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {transaction.details.plan}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Timestamps */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Timestamps
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Created At
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {new Date(transaction.createdAt).toLocaleString("en-NG")}
            </Text>
          </View>

          {transaction.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Last Updated
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {new Date(transaction.updatedAt).toLocaleString("en-NG")}
              </Text>
            </View>
          )}
        </View>

        {/* Additional Information */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Additional Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Reference
            </Text>
            <Pressable
              style={styles.copyRow}
              onPress={() =>
                copyToClipboard(transaction.reference, "reference")
              }
            >
              <Text
                style={[styles.infoValue, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {transaction.reference}
              </Text>
              <Ionicons
                name={
                  copiedField === "reference" ? "checkmark" : "copy-outline"
                }
                size={16}
                color={
                  copiedField === "reference"
                    ? colors.success
                    : colors.textMuted
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <GradientButton
            title="Share Details"
            onPress={shareTransaction}
            icon="share-outline"
          />
          <Pressable
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: colors.textPrimary },
              ]}
            >
              Back to History
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },
  header: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    flex: 1,
    textAlign: "center",
  },
  overviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  overviewInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  overviewAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    flex: 1,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    flex: 2,
    textAlign: "right",
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "flex-end",
    gap: 8,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
});
