import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useTheme";
import { AppHeader } from "@/components/ui/AppHeader";
import { useUserStore } from "@/store/userStore";
import { useDepositStore } from "@/store/depositStore";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { CopyModal } from "@/components/ui/CopyModal";
import { ResultModal } from "@/components/services/ResultModal";

export default function AddMoneyScreen() {
  const colors = useColors();
  const {
    userProfile,
    hasVirtualAccount,
    createVirtualAccount,
    isLoading: userLoading,
  } = useUserStore();
  const {
    deposits,
    isLoading: depositLoading,
    fetchDepositHistory,
    isDataStale: isDepositDataStale,
    getDeposits,
  } = useDepositStore();
  const [bvn, setBvn] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [errorResult, setErrorResult] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Fetch deposit history on component mount
  React.useEffect(() => {
    if (isDepositDataStale()) {
      fetchDepositHistory().catch((error) => {
        console.error("Failed to fetch deposit history:", error);
      });
    }
  }, [isDepositDataStale, fetchDepositHistory]);

  const handleCreateAccount = async () => {
    if (!bvn || bvn.length < 11) {
      return;
    }

    try {
      await createVirtualAccount(bvn);

      // Clear BVN input
      setBvn("");

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      setErrorResult({
        type: "error",
        title: "Account Creation Failed",
        message: "Failed to create virtual account. Please try again.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    setCopiedText(text);
    setShowCopyModal(true);
  };

  return (
    <SafeAreaView
      mode="margin"
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AppHeader />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Add Money
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Fund your wallet to start making purchases
        </Text>

        {/* Charge Notice */}
        <View
          style={[
            styles.notice,
            {
              backgroundColor: `${colors.warning}15`,
              borderColor: `${colors.warning}35`,
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={colors.warning}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.noticeTitle, { color: colors.warning }]}>
              Deposit Charges Apply
            </Text>
            <Text style={[styles.noticeText, { color: `${colors.warning}CC` }]}>
              A 10% service charge applies to all deposits to cover processing
              fees.
            </Text>
          </View>
        </View>

        {hasVirtualAccount() && userProfile?.virtualAccount ? (
          <>
            <LinearGradient
              colors={["#7C3AED", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vaCard}
            >
              <View style={styles.vaHeader}>
                <View>
                  <Text style={styles.vaSmall}>Virtual Account</Text>
                  <Text
                    style={styles.vaBank}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    TopupAfrica
                  </Text>
                </View>
                <Ionicons name="card" size={28} color="rgba(255,255,255,0.8)" />
              </View>

              <View style={styles.vaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaSmall}>Account Number</Text>
                  <Text
                    style={styles.vaNumber}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {userProfile?.virtualAccount?.accountNumber}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    copyToClipboard(
                      userProfile?.virtualAccount?.accountNumber || "",
                    )
                  }
                  style={styles.copyBtn}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color="rgba(255,255,255,0.8)"
                  />
                </Pressable>
              </View>

              <View>
                <Text style={styles.vaSmall}>Bank Name</Text>
                <Text style={styles.vaValue}>
                  {userProfile?.virtualAccount?.bankName}
                </Text>
              </View>

              <View>
                <Text style={styles.vaSmall}>Account Name</Text>
                <Text
                  style={styles.vaValue}
                  numberOfLines={2}
                  adjustsFontSizeToFit={true}
                >
                  {userProfile?.virtualAccount?.accountName}
                </Text>
              </View>
            </LinearGradient>

            {/* How to Fund */}
            <View
              style={[
                styles.howCard,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.howTitle, { color: colors.textPrimary }]}>
                How to Fund Your Wallet
              </Text>
              <View
                style={[styles.howItem, { backgroundColor: colors.bgCardAlt }]}
              >
                <Text
                  style={[styles.howItemTitle, { color: colors.textPrimary }]}
                >
                  Bank Transfer
                </Text>
                <Text style={[styles.howItemText, { color: colors.textMuted }]}>
                  Transfer money to the account details above from any bank app
                  or USSD.
                </Text>
              </View>
              <View
                style={[styles.howItem, { backgroundColor: colors.bgCardAlt }]}
              >
                <Text
                  style={[styles.howItemTitle, { color: colors.textPrimary }]}
                >
                  Instant Credit
                </Text>
                <Text style={[styles.howItemText, { color: colors.textMuted }]}>
                  Your wallet will be credited automatically within 5 minutes.
                </Text>
              </View>
              <View style={styles.minNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.blue}
                />
                <Text style={[styles.minNoteText, { color: colors.blue }]}>
                  Minimum funding amount is ₦100. Maximum is ₦500,000 per
                  transaction.
                </Text>
              </View>
            </View>

            {/* Deposit History */}
            <View style={styles.section}>
              <View style={styles.depositHeader}>
                <Ionicons name="time" size={20} color={colors.purple} />
                <View>
                  <Text
                    style={[styles.sectionTitle, { color: colors.textPrimary }]}
                  >
                    Deposit History
                  </Text>
                  <Text
                    style={[styles.sectionSub, { color: colors.textMuted }]}
                  >
                    Track your wallet funding history
                  </Text>
                </View>
              </View>

              {depositLoading ? (
                <View style={styles.loadingContainer}>
                  <Text
                    style={[styles.loadingText, { color: colors.textMuted }]}
                  >
                    Loading deposit history...
                  </Text>
                </View>
              ) : getDeposits().length === 0 ? (
                <EmptyState
                  icon="wallet-outline"
                  title="No Deposits Yet"
                  subtitle="Your deposit history will appear here"
                />
              ) : (
                <View
                  style={[
                    styles.tableWrap,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.depositTableHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.depositCol,
                        { flex: 1.5, color: colors.textMuted },
                      ]}
                    >
                      Amount
                    </Text>
                    <Text
                      style={[
                        styles.depositCol,
                        { flex: 1.5, color: colors.textMuted },
                      ]}
                    >
                      Method
                    </Text>
                    <Text
                      style={[
                        styles.depositCol,
                        {
                          flex: 1,
                          textAlign: "right",
                          color: colors.textMuted,
                        },
                      ]}
                    >
                      Status
                    </Text>
                  </View>
                  {getDeposits().map((dep, i) => (
                    <View
                      key={dep.id}
                      style={[
                        styles.depositRow,
                        i < getDeposits().length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.depositAmount,
                          { flex: 1.5, color: colors.textPrimary },
                        ]}
                      >
                        ₦{dep.amount.toLocaleString()}
                      </Text>
                      <Text
                        style={[
                          styles.depositMethod,
                          { flex: 1.5, color: colors.textSecondary },
                        ]}
                      >
                        {dep.description}
                      </Text>
                      <Text
                        style={[
                          styles.depositStatus,
                          {
                            flex: 1,
                            textAlign: "right",
                            color:
                              dep.status === "completed"
                                ? colors.success
                                : dep.status === "failed"
                                  ? colors.error
                                  : colors.warning,
                          },
                        ]}
                      >
                        {dep.status}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <View
            style={[
              styles.bvnCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <View style={styles.verificationHeader}>
              <Text
                style={[
                  styles.verificationTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Identity Verification Required
              </Text>
              <Text
                style={[
                  styles.verificationSubtitle,
                  { color: colors.textMuted },
                ]}
              >
                Choose a verification method to generate virtual account details
              </Text>
            </View>

            <View style={styles.verificationReasons}>
              <Text
                style={[styles.reasonsTitle, { color: colors.textPrimary }]}
              >
                Why verification is needed:
              </Text>
              <Text style={[styles.reasonItem, { color: colors.textMuted }]}>
                • To verify your identity and prevent fraud
              </Text>
              <Text style={[styles.reasonItem, { color: colors.textMuted }]}>
                • To comply with CBN regulations
              </Text>
              <Text style={[styles.reasonItem, { color: colors.textMuted }]}>
                • To generate your unique virtual account
              </Text>
              <Text style={[styles.reasonItem, { color: colors.textMuted }]}>
                • Your information is encrypted and securely stored
              </Text>
            </View>
            <Input
              label="Bank Verification Number (BVN)"
              placeholder="Enter your 11-digit BVN"
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              maxLength={11}
            />
            <GradientButton
              title="Generate Bank Details"
              onPress={handleCreateAccount}
              loading={userLoading}
              disabled={userLoading || bvn.length < 11}
            />
            {userLoading && (
              <Text
                style={{
                  color: colors.purple,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Creating your virtual account...
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Virtual Account Created!"
        message="Your virtual account has been created successfully. You can now fund your wallet using the account details provided."
        icon="card"
      />

      {/* Copy Modal */}
      <CopyModal
        visible={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        copiedText={copiedText}
      />

      {/* Error Modal */}
      {errorResult && (
        <ResultModal
          visible={!!errorResult}
          type={errorResult.type}
          title={errorResult.title}
          message={errorResult.message}
          onClose={() => setErrorResult(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_400Regular", marginBottom: 20 },
  notice: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  noticeTitle: { fontSize: 14, fontFamily: "Nunito_700Bold", marginBottom: 2 },
  noticeText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  vaCard: { borderRadius: 20, padding: 24, gap: 18, marginBottom: 20 },
  vaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vaSmall: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    marginBottom: 4,
  },
  vaBank: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    flex: 1,
    minWidth: 0,
  },
  vaRow: { flexDirection: "row", alignItems: "center" },
  vaNumber: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    flex: 1,
    minWidth: 0,
  },
  copyBtn: { padding: 8 },
  vaValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    flex: 1,
    minWidth: 0,
  },
  howCard: {
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  howTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  howItem: { borderRadius: 12, padding: 14, gap: 4 },
  howItemTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  howItemText: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    lineHeight: 20,
  },
  minNote: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  minNoteText: {
    fontSize: 13,
    fontFamily: "Nunito_500Medium",
    flex: 1,
    lineHeight: 20,
  },
  section: { marginBottom: 24 },
  depositHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  tableWrap: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  depositTableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  depositCol: { fontSize: 12, fontFamily: "Nunito_600SemiBold" },
  depositRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  depositAmount: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  depositMethod: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  depositStatus: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  bvnCard: { borderRadius: 20, padding: 24, gap: 16, borderWidth: 1 },
  bvnIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  bvnTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },
  bvnSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
  },
  verificationHeader: {
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  verificationReasons: {
    marginBottom: 24,
    gap: 8,
  },
  reasonsTitle: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 8,
  },
  reasonItem: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    lineHeight: 20,
  },
});
