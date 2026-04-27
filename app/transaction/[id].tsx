import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
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

// Helper function to get transaction description
function getTransactionDescription(transaction: any) {
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
}

function getServiceIcon(type: string, colors: any) {
  switch (type) {
    case "airtime":
      return { icon: "phone-portrait", color: colors.airtime };
    case "data":
      return { icon: "wifi", color: colors.data };
    case "electricity":
      return { icon: "flash", color: colors.electricity };
    case "cable":
      return { icon: "tv-outline", color: colors.cable };
    case "bills":
      return { icon: "receipt-outline", color: colors.bills };
    case "internet":
      return { icon: "globe-outline", color: colors.internet };
    case "deposit":
      return { icon: "card-outline", color: colors.success };
    default:
      return { icon: "cash-outline", color: colors.purple };
  }
}

function InfoRow({
  label,
  value,
  valueColor,
  copyable,
  borderColor,
  labelColor,
  textColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
  copyable?: boolean;
  borderColor: string;
  labelColor: string;
  textColor: string;
}) {
  const copy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Copied!", `${value} copied to clipboard`);
  };

  return (
    <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
      <Text style={[styles.infoLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text
          style={[styles.infoValue, { color: valueColor || textColor }]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {value}
        </Text>
        {copyable && (
          <Pressable onPress={copy}>
            <Ionicons name="copy-outline" size={16} color={labelColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, isLoading } = useTransactionStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Find transaction from existing list (same pattern as web client)
  const transaction = transactions
    ? transactions.find((tx) => tx._id === id)
    : null;

  const topPadding = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!transaction) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.bgPrimary, paddingTop: topPadding },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Transaction Details
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>
            {isLoading ? "Loading..." : "Transaction not found"}
          </Text>
        </View>
      </View>
    );
  }

  const { icon, color } = getServiceIcon(transaction.type, colors);
  const statusColor =
    transaction.status === "completed"
      ? colors.success
      : transaction.status === "failed"
        ? colors.error
        : colors.warning;
  const baseAmount = transaction.amount - (transaction.feeAmount || 0);
  const feePercent =
    baseAmount > 0
      ? (((transaction.feeAmount || 0) / baseAmount) * 100).toFixed(2)
      : "0";

  const infoProps = {
    borderColor: colors.border,
    labelColor: colors.textMuted,
    textColor: colors.textPrimary,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Transaction Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {getTransactionDescription(transaction)}
          </Text>
          <Text style={[styles.heroDate, { color: colors.textMuted }]}>
            {new Date(transaction.createdAt).toLocaleString("en-NG")}
          </Text>
          <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>
            ₦{transaction.amount.toLocaleString()}
          </Text>
          {transaction.feeAmount && transaction.feeAmount > 0 && (
            <Text style={[styles.heroFee, { color: colors.textMuted }]}>
              (₦{baseAmount.toLocaleString()} + ₦{transaction.feeAmount} fees)
            </Text>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            Basic Information
          </Text>
          <InfoRow
            {...infoProps}
            label="Transaction ID"
            value={transaction._id}
            copyable
          />
          <InfoRow
            {...infoProps}
            label="Type"
            value={
              transaction.type.charAt(0).toUpperCase() +
              transaction.type.slice(1)
            }
          />
          <InfoRow
            {...infoProps}
            label="Amount"
            value={`₦${transaction.amount.toLocaleString()}`}
          />
          <InfoRow
            {...infoProps}
            label="Net Amount"
            value={`₦${(transaction.netAmount || transaction.amount).toLocaleString()}`}
          />
          <InfoRow
            {...infoProps}
            label="Status"
            value={transaction.status}
            valueColor={statusColor}
          />
          <InfoRow
            {...infoProps}
            label="Customer Name"
            value={transaction.fullName}
          />
          {transaction.details?.provider && (
            <InfoRow
              {...infoProps}
              label="Provider"
              value={transaction.details.provider}
            />
          )}
          {transaction.details?.mobileNumber && (
            <InfoRow
              {...infoProps}
              label="Phone Number"
              value={transaction.details.mobileNumber}
              copyable
            />
          )}
          <InfoRow
            {...infoProps}
            label="Reference"
            value={transaction.reference}
            copyable
          />
          <View style={[styles.lastInfoRow]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Date
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {new Date(transaction.createdAt).toLocaleString("en-NG")}
            </Text>
          </View>
        </View>

        {/* Fee Breakdown */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            Fee Breakdown
          </Text>

          {transaction.type === "deposit" ? (
            // Deposit fee breakdown
            <>
              <InfoRow
                {...infoProps}
                label="Amount Deposited"
                value={`₦${transaction.amount.toLocaleString()}`}
              />

              {transaction.feeAmount && transaction.feeAmount > 0 && (
                <InfoRow
                  {...infoProps}
                  label={`Service Fee (${transaction.feePercentage || 0}%)`}
                  value={`-₦${transaction.feeAmount.toLocaleString()}`}
                  valueColor={colors.error}
                />
              )}

              <View
                style={[styles.divider, { borderBottomColor: colors.border }]}
              />

              <View style={styles.totalRow}>
                <Text
                  style={[styles.totalLabel, { color: colors.textPrimary }]}
                >
                  Amount Credited
                </Text>
                <Text style={[styles.totalValue, { color: colors.success }]}>
                  ₦
                  {(
                    transaction.netAmount || transaction.amount
                  ).toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            // Service fee breakdown
            <>
              {transaction.originalAmount && (
                <InfoRow
                  {...infoProps}
                  label="Original Price"
                  value={`₦${transaction.originalAmount.toLocaleString()}`}
                />
              )}

              {transaction.feeAmount && transaction.feeAmount > 0 && (
                <InfoRow
                  {...infoProps}
                  label={`Service Fee (${transaction.feePercentage || 0}%)`}
                  value={`+₦${transaction.feeAmount.toLocaleString()}`}
                  valueColor={colors.error}
                />
              )}

              {transaction.profitAmount && transaction.profitAmount > 0 && (
                <InfoRow
                  {...infoProps}
                  label={`Service Charge (${transaction.markupPercentage || 0}%)`}
                  value={`+₦${transaction.profitAmount.toLocaleString()}`}
                  valueColor={colors.error}
                />
              )}

              <View
                style={[styles.divider, { borderBottomColor: colors.border }]}
              />

              <View style={styles.totalRow}>
                <Text
                  style={[styles.totalLabel, { color: colors.textPrimary }]}
                >
                  Total Charged
                </Text>
                <Text style={[styles.totalValue, { color: colors.error }]}>
                  ₦{transaction.amount.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Service Details - Hide for deposit transactions */}
        {transaction.details &&
          transaction.type !== "deposit" &&
          (transaction.details.network ||
            transaction.details.mobileNumber ||
            transaction.details.provider ||
            transaction.details.meterNum ||
            transaction.details.cableNum ||
            transaction.details.plan ||
            transaction.details.method) && (
            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
                Service Details
              </Text>

              {transaction.details.network && (
                <InfoRow
                  {...infoProps}
                  label="Network"
                  value={transaction.details.network}
                />
              )}

              {transaction.details.mobileNumber && (
                <InfoRow
                  {...infoProps}
                  label="Phone Number"
                  value={transaction.details.mobileNumber}
                  copyable
                />
              )}

              {transaction.details.provider && (
                <InfoRow
                  {...infoProps}
                  label="Provider"
                  value={transaction.details.provider}
                />
              )}

              {transaction.details.meterNum && (
                <InfoRow
                  {...infoProps}
                  label="Meter Number"
                  value={transaction.details.meterNum}
                  copyable
                />
              )}

              {transaction.details.cableNum && (
                <InfoRow
                  {...infoProps}
                  label="Smart Card Number"
                  value={transaction.details.cableNum}
                  copyable
                />
              )}

              {transaction.details.plan && (
                <InfoRow
                  {...infoProps}
                  label="Plan"
                  value={transaction.details.plan}
                />
              )}

              {transaction.details.method && (
                <InfoRow
                  {...infoProps}
                  label="Payment Method"
                  value={
                    transaction.details.method.charAt(0).toUpperCase() +
                    transaction.details.method.slice(1)
                  }
                />
              )}
            </View>
          )}

        {/* Timestamps */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            Timestamps
          </Text>

          <InfoRow
            {...infoProps}
            label="Created At"
            value={new Date(transaction.createdAt).toLocaleString("en-NG")}
          />

          {transaction.updatedAt && (
            <InfoRow
              {...infoProps}
              label="Last Updated"
              value={new Date(transaction.updatedAt).toLocaleString("en-NG")}
            />
          )}
        </View>

        {/* Additional Information */}
        {transaction.reference && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Additional Information
            </Text>

            <InfoRow
              {...infoProps}
              label="Reference"
              value={transaction.reference}
              copyable
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitle: { fontSize: 20, fontFamily: "Nunito_700Bold" },
  heroDate: { fontSize: 13, fontFamily: "Nunito_400Regular", marginBottom: 4 },
  heroAmount: { fontSize: 32, fontFamily: "Nunito_800ExtraBold" },
  heroFee: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  infoCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 14 },
  infoTitle: { fontSize: 17, fontFamily: "Nunito_700Bold", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lastInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  infoValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "right",
    flexShrink: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  totalValue: { fontSize: 17, fontFamily: "Nunito_800ExtraBold" },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 16, fontFamily: "Nunito_400Regular" },
});
