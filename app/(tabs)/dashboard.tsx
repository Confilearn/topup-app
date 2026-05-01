import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useUserStore } from "@/store/userStore";
import { useReferralStore } from "@/store/referralStore";
import { useVtuStore } from "@/store/vtu-store";
import { AppHeader } from "@/components/ui/AppHeader";
import { AirtimeModal } from "@/components/services/AirtimeModal";
import { DataModal } from "@/components/services/DataModal";
import { ElectricityModal } from "@/components/services/ElectricityModal";
import { CableModal } from "@/components/services/CableModal";
import { UnavailableServiceModal } from "@/components/services/UnavailableServiceModal";
import RecentTransactions from "@/components/transactions/RecentTransactions";

type ServiceType =
  | "airtime"
  | "data"
  | "electricity"
  | "cable"
  | "bills"
  | "internet"
  | null;

// Function to format large amounts with appropriate sizing
const formatBalance = (amount: number) => {
  if (amount >= 1000000) {
    return {
      text: `₦${(amount / 1000000).toFixed(1)}M`,
      fontSize: 28,
    };
  } else if (amount >= 1000) {
    return {
      text: `₦${(amount / 1000).toFixed(1)}K`,
      fontSize: 30,
    };
  } else {
    return {
      text: `₦${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      fontSize: 32,
    };
  }
};

const SERVICES = [
  {
    id: "airtime",
    icon: "phone-portrait",
    colorKey: "airtime",
    label: "Airtime",
  },
  { id: "data", icon: "wifi", colorKey: "data", label: "Data" },
  {
    id: "electricity",
    icon: "flash",
    colorKey: "electricity",
    label: "Electricity",
  },
  { id: "cable", icon: "tv", colorKey: "cable", label: "Cable TV" },
  { id: "bills", icon: "receipt", colorKey: "bills", label: "Bills" },
  { id: "internet", icon: "globe", colorKey: "internet", label: "Internet" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useAuthStore();
  const { recentTransactions, fetchRecentTransactions } = useTransactionStore();
  const {
    userProfile,
    fetchUserProfile,
    isDataStale,
    isLoading: userLoading,
  } = useUserStore();
  const {
    fetchReferralHistory,
    isDataStale: isReferralDataStale,
    setCurrentUser,
  } = useReferralStore();
  const {
    fetchServices: fetchVtuServices,
    isLoading: vtuLoading,
    lastUpdated: vtuLastUpdated,
    clearCacheAndRefetch,
  } = useVtuStore();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<ServiceType>(null);
  const [unavailableService, setUnavailableService] = useState<string | null>(
    null,
  );
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }, []),
  );

  // Fetch user profile on component mount and when user changes
  useEffect(() => {
    if (user?.id && (!userProfile || isDataStale())) {
      fetchUserProfile(user.id);
    }
  }, [user?.id, userProfile, isDataStale, fetchUserProfile]);

  // Set current user for referral store and fetch referral history if stale
  useEffect(() => {
    if (user?.id) {
      setCurrentUser(user.id);
      if (isReferralDataStale()) {
        fetchReferralHistory().catch((error) => {
          console.error("Failed to fetch referral data:", error);
        });
      }
    } else {
      setCurrentUser(null);
    }
  }, [user?.id, isReferralDataStale, fetchReferralHistory, setCurrentUser]);

  // Fetch recent transactions on component mount
  useEffect(() => {
    if (user?.id) {
      fetchRecentTransactions().catch((error) => {
        console.error("Failed to fetch recent transactions:", error);
      });
    }
  }, [user?.id, fetchRecentTransactions]);

  // Fetch VTU services on component mount (will use cache if available)
  useEffect(() => {
    if (user?.id) {
      fetchVtuServices().catch((error) => {
        console.error("Failed to fetch VTU services:", error);
      });
    }
  }, [user?.id, fetchVtuServices]);

  // Clear VTU cache and refetch for testing
  useEffect(() => {
    if (user?.id) {
      // Add a delay to let the initial fetch complete, then clear cache
      setTimeout(() => {
        console.log("🔄 Triggering cache clear and refetch...");
        clearCacheAndRefetch().catch((error) => {
          console.error("Failed to clear cache and refetch:", error);
        });
      }, 2000);
    }
  }, [user?.id, clearCacheAndRefetch]);

  const onRefresh = async () => {
    setRefreshing(true);

    // Refresh user profile if data is stale
    if (user?.id && isDataStale()) {
      try {
        await fetchUserProfile(user.id);
        // Balance will be automatically synced by the effect
      } catch (error) {
        console.error("Failed to refresh user profile:", error);
      }
    }

    // Refresh referral data if stale
    if (user && isReferralDataStale()) {
      try {
        await fetchReferralHistory();
      } catch (error) {
        console.error("Failed to refresh referral data:", error);
      }
    }

    // Refresh VTU services
    try {
      await fetchVtuServices(true); // Force refresh
    } catch (error) {
      console.error("Failed to refresh VTU services:", error);
    }

    setRefreshing(false);
  };

  return (
    <SafeAreaView
      mode="margin"
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.purple}
          />
        }
      >
        <AppHeader />

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetTitle, { color: colors.textPrimary }]}>
            Hi, {userProfile?.firstName || user?.firstName}!
          </Text>
          <Text style={[styles.greetSub, { color: colors.textMuted }]}>
            {userProfile?.hasPurchased
              ? "Ready for another top-up?"
              : "Ready to top up today?"}
          </Text>
          {/* Show additional user info if available */}
          {userProfile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.success}
              />
              <Text style={[styles.verifiedText, { color: colors.success }]}>
                Verified Account
              </Text>
            </View>
          )}
        </View>

        {/* Wallet Card */}
        <LinearGradient
          colors={["#2D1B69", "#1E3A8A", "#1A1A50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <View style={styles.balanceRow}>
            <Text
              style={[
                styles.balanceAmount,
                balanceVisible &&
                userProfile?.balance &&
                userProfile.balance >= 1000
                  ? { fontSize: formatBalance(userProfile.balance).fontSize }
                  : undefined,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {balanceVisible
                ? userProfile?.balance
                  ? formatBalance(userProfile.balance).text
                  : `₦${(0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                : "₦••••••"}
            </Text>
            <Pressable
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </Pressable>
          </View>
          <Pressable
            style={styles.fundBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/add-money");
            }}
          >
            <Text style={styles.fundBtnText}>Fund Wallet</Text>
          </Pressable>
        </LinearGradient>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Services
          </Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((s) => {
              const svcColor = (colors as any)[s.colorKey];
              return (
                <Pressable
                  key={s.id}
                  style={({ pressed }) => [
                    styles.serviceItem,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                      transform: pressed ? [{ scale: 0.95 }] : [],
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Check if service is unavailable
                    if (
                      s.id === "cable" ||
                      s.id === "bills" ||
                      s.id === "internet"
                    ) {
                      setUnavailableService(s.label);
                    } else {
                      setActiveModal(s.id as ServiceType);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      { backgroundColor: `${svcColor}20` },
                    ]}
                  >
                    <Ionicons name={s.icon as any} size={24} color={svcColor} />
                  </View>
                  <Text
                    style={[styles.serviceLabel, { color: colors.textPrimary }]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <RecentTransactions
            maxItems={3}
            compact={true}
            onViewAll={() => router.push("/(tabs)/transactions")}
          />
        </View>
      </ScrollView>

      <AirtimeModal
        visible={activeModal === "airtime"}
        onClose={() => setActiveModal(null)}
      />
      <DataModal
        visible={activeModal === "data"}
        onClose={() => setActiveModal(null)}
      />
      <ElectricityModal
        visible={activeModal === "electricity"}
        onClose={() => setActiveModal(null)}
      />
      <CableModal
        visible={activeModal === "cable"}
        onClose={() => setActiveModal(null)}
      />

      <UnavailableServiceModal
        visible={!!unavailableService}
        onClose={() => setUnavailableService(null)}
        serviceName={unavailableService || ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  greeting: { marginBottom: 20 },
  greetTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 4,
  },
  greetSub: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  walletCard: { borderRadius: 20, padding: 24, marginBottom: 28 },
  walletLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    flex: 1,
    minWidth: 0,
  },
  eyeBtn: { padding: 4 },
  fundBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  fundBtnText: { color: "#C4B5FD", fontSize: 15, fontFamily: "Nunito_700Bold" },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceItem: {
    width: "30%",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    flexGrow: 0,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  txList: { gap: 10 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
});
