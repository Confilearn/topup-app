import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useTheme";
import { AppHeader } from "@/components/ui/AppHeader";
import { useUserStore } from "@/store/userStore";
import { useReferralStore } from "@/store/referralStore";
import { useReferralSettingsStore } from "@/store/referralSettingsStore";
import { ResultModal } from "@/components/services/ResultModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReferralDisabled } from "@/components/ui/ReferralDisabled";

/**
 * Referrals Page - Standalone page for referral management
 * Accessed via sidebar navigation only
 * Features real data integration, copy/share functionality, and beautiful modals
 */
export default function ReferralsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile } = useUserStore();
  const {
    referralHistory,
    isLoading: referralLoading,
    error: referralError,
    getReferredUsers,
  } = useReferralStore();
  const {
    settings: referralSettings,
    isLoading: settingsLoading,
    fetchReferralSettings,
    isDataStale: isSettingsDataStale,
    isReferralEnabled,
    getDisabledMessage,
  } = useReferralSettingsStore();

  // State for beautiful modal feedback
  const [result, setResult] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Fetch referral settings on component mount
  useEffect(() => {
    if (isSettingsDataStale()) {
      fetchReferralSettings().catch((error) => {
        console.error("Failed to fetch referral settings:", error);
      });
    }
  }, [isSettingsDataStale, fetchReferralSettings]);

  const topPadding = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  // Format currency with proper Nigerian Naira symbol
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "₦0";
    }
    return `₦${amount.toLocaleString()}`;
  };

  // Generate referral link from user's referral code
  const referralLink = userProfile?.referralCode
    ? `https://topupafrica.online/signup?ref=${userProfile.referralCode}`
    : null;

  // Dynamic stat cards using real user data
  const STAT_CARDS = [
    {
      label: "Total Referrals",
      value: String(userProfile?.referrals?.totalReferrals || 0),
      icon: "people",
      color: colors.purple,
    },
    {
      label: "Total Earnings",
      value: formatCurrency(userProfile?.referrals?.totalEarnings),
      icon: "wallet",
      color: colors.success,
    },
    {
      label: "Active Referrals",
      value: String(userProfile?.referrals?.activeReferrals || 0),
      icon: "checkmark-circle",
      color: colors.success,
    },
    {
      label: "Pending Earnings",
      value: formatCurrency(userProfile?.referrals?.pendingEarnings),
      icon: "time",
      color: colors.warning,
    },
  ];

  /**
   * Copy referral link to clipboard with beautiful success modal
   */
  const copyReferralLink = async () => {
    if (!referralLink) {
      setResult({
        type: "error",
        title: "No Referral Link",
        message: "Referral link is not available at the moment.",
      });
      return;
    }

    try {
      await Share.share({
        message: referralLink,
        title: "Share Referral Link",
      });

      // Show success modal
      setResult({
        type: "success",
        title: "Link Shared!",
        message: "Your referral link has been shared successfully.",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to share link:", error);
      setResult({
        type: "error",
        title: "Share Failed",
        message: "Could not share referral link. Please try again.",
      });
    }
  };

  /**
   * Copy referral code to clipboard with beautiful success modal
   */
  const copyReferralCode = async () => {
    if (!userProfile?.referralCode) {
      setResult({
        type: "error",
        title: "No Referral Code",
        message: "Referral code is not available at the moment.",
      });
      return;
    }

    try {
      await Share.share({
        message: `My referral code: ${userProfile.referralCode}`,
        title: "Share Referral Code",
      });

      // Show success modal
      setResult({
        type: "success",
        title: "Code Copied!",
        message: "Your referral code has been copied successfully.",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to copy code:", error);
      setResult({
        type: "error",
        title: "Copy Failed",
        message: "Could not copy referral code. Please try again.",
      });
    }
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
        <AppHeader />

        {/* Show loading state while fetching settings */}
        {settingsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading referral settings...
            </Text>
          </View>
        ) : !isReferralEnabled() ? (
          /* Show disabled message if referral is disabled */
          <ReferralDisabled message={getDisabledMessage()} />
        ) : (
          <>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Referrals
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Earn rewards by inviting friends
            </Text>

            <View style={styles.statsGrid}>
              {STAT_CARDS.map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: `${s.color}20` },
                    ]}
                  >
                    <Ionicons name={s.icon as any} size={20} color={s.color} />
                  </View>
                  <Text
                    style={[styles.statValue, { color: colors.textPrimary }]}
                  >
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.linkCard,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Your Referral Link
              </Text>
              <View
                style={[
                  styles.linkBox,
                  {
                    backgroundColor: colors.bgCardAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="link-outline" size={18} color={colors.purple} />
                <Text
                  style={[styles.linkText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {referralLink || "Loading..."}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <Pressable
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: `${colors.purple}20`,
                      borderColor: colors.purple,
                    },
                  ]}
                  onPress={copyReferralLink}
                >
                  <Ionicons
                    name="share-outline"
                    size={16}
                    color={colors.purpleLight}
                  />
                  <Text
                    style={[styles.actionText, { color: colors.purpleLight }]}
                  >
                    Share Link
                  </Text>
                </Pressable>
              </View>
              <View
                style={[styles.codeRow, { backgroundColor: colors.bgCardAlt }]}
              >
                <Text style={[styles.codeLabel, { color: colors.textMuted }]}>
                  Referral Code
                </Text>
                <View style={styles.codeBox}>
                  <Text
                    style={[styles.codeText, { color: colors.purpleLight }]}
                  >
                    {userProfile?.referralCode || "Loading..."}
                  </Text>
                  <Pressable onPress={copyReferralCode}>
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={colors.purple}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Referred Users Section */}
            <View style={styles.usersSection}>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Referred Users
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                {getReferredUsers().length} users referred
              </Text>

              {/* Loading state */}
              {referralLoading && (
                <View style={styles.loadingContainer}>
                  <Text
                    style={[styles.loadingText, { color: colors.textMuted }]}
                  >
                    Loading referred users...
                  </Text>
                </View>
              )}

              {/* Error state */}
              {referralError && !referralLoading && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {referralError}
                  </Text>
                </View>
              )}

              {/* Empty state */}
              {!referralLoading &&
                !referralError &&
                getReferredUsers().length === 0 && (
                  <EmptyState
                    icon="people-outline"
                    title="No Referrals Yet"
                    subtitle="Share your referral link to start earning rewards"
                  />
                )}

              {/* Users list */}
              {!referralLoading &&
                !referralError &&
                getReferredUsers().length > 0 && (
                  <View style={styles.userList}>
                    {getReferredUsers().map((referral) => (
                      <View
                        key={referral._id}
                        style={[
                          styles.userCard,
                          {
                            backgroundColor: colors.bgCard,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.userAvatar,
                            { backgroundColor: `${colors.purple}30` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.userInitial,
                              { color: colors.purpleLight },
                            ]}
                          >
                            {referral.referredUser.username[0]?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.userInfo}>
                          <Text
                            style={[
                              styles.userName,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {referral.referredUser.username}
                          </Text>
                          <Text
                            style={[
                              styles.userDate,
                              { color: colors.textMuted },
                            ]}
                          >
                            Joined {referral.referredUser.joinDate}
                          </Text>
                        </View>
                        <View style={styles.userRight}>
                          <Text
                            style={[
                              styles.userEarning,
                              { color: colors.success },
                            ]}
                          >
                            +{formatCurrency(referral.referredUser.earnings)}
                          </Text>
                          <View
                            style={[
                              styles.userBadge,
                              {
                                backgroundColor:
                                  referral.referredUser.status === "active"
                                    ? `${colors.success}20`
                                    : referral.referredUser.status === "pending"
                                      ? `${colors.warning}20`
                                      : `${colors.textMuted}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.userBadgeText,
                                {
                                  color:
                                    referral.referredUser.status === "active"
                                      ? colors.success
                                      : referral.referredUser.status ===
                                          "pending"
                                        ? colors.warning
                                        : colors.textMuted,
                                },
                              ]}
                            >
                              {referral.referredUser.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Result Modal for beautiful feedback */}
      {result && (
        <ResultModal
          visible={!!result}
          type={result.type}
          title={result.title}
          message={result.message}
          onClose={() => setResult(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_400Regular", marginBottom: 24 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 20, fontFamily: "Nunito_800ExtraBold" },
  statLabel: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  linkCard: {
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  linkText: { flex: 1, fontSize: 13, fontFamily: "Nunito_400Regular" },
  linkActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  codeLabel: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  codeBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  codeText: { fontSize: 15, fontFamily: "Nunito_700Bold" },

  // Referred users section styles
  usersSection: { gap: 16, marginTop: 8 },
  userList: { gap: 12 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  userDate: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  userRight: { alignItems: "flex-end", gap: 6 },
  userEarning: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  userBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  userBadgeText: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },

  // Loading and error states
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    textAlign: "center",
  },
});
