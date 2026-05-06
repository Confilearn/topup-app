import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useTheme";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { ResultModal } from "@/components/services/ResultModal";
import { PinModal } from "@/components/services/PinModal";
import { userAPI, authAPI } from "@/lib/api";

export default function SettingsScreen() {
  const colors = useColors();
  const { user, logout, login, updatePassword, updateProfile } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { userProfile, updateUserProfile, fetchUserProfile } = useUserStore();
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }, []),
  );

  // Initialize form with fetched user profile data, fallback to auth store
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile?.firstName || user?.firstName || "",
    lastName: userProfile?.lastName || user?.lastName || "",
    email: userProfile?.email || user?.email || "",
    phone: userProfile?.phone || user?.phone || "",
  });

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showResetPin, setShowResetPin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Transaction pin states
  const [pinForm, setPinForm] = useState({ newPin: "", confirmPin: "" });
  const [showSetPin, setShowSetPin] = useState(false);
  const [hasTransactionPin, setHasTransactionPin] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check if user has transaction pin
  useEffect(() => {
    setHasTransactionPin(!!userProfile?.transactionPin);
  }, [userProfile?.transactionPin]);

  const handleUpdateProfile = async () => {
    if (!user?.id) {
      setResult({
        type: "error",
        title: "Update Failed",
        message: "User ID not found. Please log in again.",
      });
      return;
    }

    setLoading(true);
    try {
      // Use authStore updateProfile function with offline protection
      const success = await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      });

      if (success) {
        // Update user profile store with the same data
        updateUserProfile({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
        });

        setResult({
          type: "success",
          title: "Profile Updated!",
          message: "Your profile has been updated successfully.",
        });
      }
      // If success is false (offline), don't show success modal
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setResult({
        type: "error",
        title: "Update Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) return;
    if (pwForm.newPw !== pwForm.confirm) {
      setResult({
        type: "error",
        title: "Password Mismatch",
        message: "New passwords do not match.",
      });
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pwForm.newPw)) {
      setResult({
        type: "error",
        title: "Weak Password",
        message:
          "Password must be at least 8 characters with uppercase, lowercase, and number.",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await updatePassword(pwForm.current, pwForm.newPw);
      if (success) {
        setPwForm({ current: "", newPw: "", confirm: "" });
        setResult({
          type: "success",
          title: "Password Changed!",
          message: "Your password has been updated successfully.",
        });
      }
      // If success is false (offline), don't show success modal
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";

      // Handle specific authentication errors
      if (
        errorMessage.includes("No authentication token") ||
        errorMessage.includes("Authentication failed")
      ) {
        setResult({
          type: "error",
          title: "Authentication Required",
          message: "Your session has expired. Please log in again.",
        });
      } else if (errorMessage.includes("Invalid token")) {
        setResult({
          type: "error",
          title: "Session Expired",
          message: "Your session has expired. Please log in again.",
        });
      } else {
        setResult({
          type: "error",
          title: "Password Change Failed",
          message:
            errorMessage ||
            "Failed to change password. Please check your current password and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetTransactionPin = async () => {
    if (!pinForm.newPin || !pinForm.confirmPin) {
      setResult({
        type: "error",
        title: "Invalid Input",
        message: "Please enter and confirm your transaction PIN.",
      });
      return;
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setResult({
        type: "error",
        title: "PIN Mismatch",
        message: "Transaction PINs do not match.",
      });
      return;
    }

    if (pinForm.newPin.length !== 4) {
      setResult({
        type: "error",
        title: "Invalid PIN",
        message: "Transaction PIN must be 4 digits.",
      });
      return;
    }

    if (!user?.id) {
      setResult({
        type: "error",
        title: "Update Failed",
        message: "User ID not found. Please log in again.",
      });
      return;
    }

    setLoading(true);
    try {
      // Call API to set transaction pin
      await userAPI.setTransactionPin(user.id, pinForm.newPin);

      // Update local state
      setHasTransactionPin(true);

      // Close both modals (set pin and reset pin modals)
      setShowSetPin(false);
      setShowPinModal(false);
      setPinForm({ newPin: "", confirmPin: "" });

      setResult({
        type: "success",
        title: "Transaction PIN Updated!",
        message: "Your transaction PIN has been updated successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to set transaction PIN. Please try again.";
      setResult({
        type: "error",
        title: "PIN Setup Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForPinReset = async () => {
    if (!verifyPassword) {
      setResult({
        type: "error",
        title: "Password Required",
        message: "Please enter your account password to continue.",
      });
      return;
    }

    setLoading(true);
    try {
      // Debug: Check if email and password are available
      console.log("PIN Verification - Auth user:", user);
      console.log("PIN Verification - User profile:", userProfile);
      console.log("PIN Verification - Password provided:", !!verifyPassword);

      // Try to get email from authStore user first, then fallback to userProfile
      const userEmail = user?.email || userProfile?.email;

      if (!userEmail || !verifyPassword) {
        console.log("PIN Verification - Missing email or password");
        console.log("Email from authStore:", user?.email);
        console.log("Email from userProfile:", userProfile?.email);

        setResult({
          type: "error",
          title: "Verification Failed",
          message:
            "Unable to verify account. Please ensure you're logged in and enter your password.",
        });
        return;
      }

      console.log("PIN Verification - Using email:", userEmail);
      // Use authStore login function with offline protection
      const loginSuccess = await login(userEmail, verifyPassword);

      if (loginSuccess) {
        // Password is correct, proceed with reset flow
        setShowResetPin(false);
        setVerifyPassword("");
        setShowPinModal(true);

        setResult({
          type: "success",
          title: "Password Verified",
          message: "Password verified successfully. Please set your new PIN.",
        });
      } else {
        // Login failed (either wrong password or offline)
        // Don't show error modal if offline - let the offline modal handle it
        if (!loginSuccess) {
          // If login failed, don't show additional error modal
          // The offline modal will be shown by the login function if needed
          return;
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password verification failed";
      setResult({
        type: "error",
        title: "Wrong Password",
        message: "Incorrect account password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AppHeader />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Profile & Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Manage your account settings and security
        </Text>

        {/* Personal Info */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={["#7C3AED", "#3B82F6"]}
              style={styles.headerIcon}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Personal Information
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                Update your personal details
              </Text>
            </View>
          </View>
          <View style={styles.form}>
            <Input
              label="First Name"
              value={profileForm.firstName}
              onChangeText={(v) =>
                setProfileForm((f) => ({ ...f, firstName: v }))
              }
            />
            <Input
              label="Last Name"
              value={profileForm.lastName}
              onChangeText={(v) =>
                setProfileForm((f) => ({ ...f, lastName: v }))
              }
            />
            <Input
              label="Email"
              placeholder="john@example.com"
              value={profileForm.email}
              onChangeText={(v) => setProfileForm((f) => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Email is read-only - server doesn't support email updates
            />
            <Input
              label="Phone Number"
              value={profileForm.phone}
              onChangeText={(v) => setProfileForm((f) => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
            />
            <GradientButton
              title="Update Profile"
              onPress={handleUpdateProfile}
              loading={loading}
            />
          </View>
        </View>

        {/* Security */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.headerIcon,
                { backgroundColor: `${colors.error}25` },
              ]}
            >
              <Ionicons name="shield" size={20} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Security Settings
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                Manage your account security
              </Text>
            </View>
          </View>
          <View style={styles.securityList}>
            {[
              {
                icon: "lock-closed-outline",
                title: hasTransactionPin
                  ? "Change Transaction PIN"
                  : "Set Transaction PIN",
                sub: hasTransactionPin
                  ? "Update your 4-digit PIN"
                  : "Set up your 4-digit PIN",
                onPress: () =>
                  hasTransactionPin
                    ? setShowResetPin(true)
                    : setShowSetPin(true),
                disabled: false,
              },
            ]
              .filter((item) => !item.disabled)
              .map((item, i) => (
                <React.Fragment key={item.title}>
                  {i > 0 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      styles.secItem,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={item.onPress}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.secItemTitle,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.secItemSub, { color: colors.textMuted }]}
                      >
                        {item.sub}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </React.Fragment>
              ))}
          </View>
        </View>

        {/* Change Password */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Change Password
          </Text>
          <View style={styles.form}>
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={pwForm.current}
              onChangeText={(v) => setPwForm((f) => ({ ...f, current: v }))}
              isPassword
            />
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={pwForm.newPw}
              onChangeText={(v) => setPwForm((f) => ({ ...f, newPw: v }))}
              isPassword
            />
            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={pwForm.confirm}
              onChangeText={(v) => setPwForm((f) => ({ ...f, confirm: v }))}
              isPassword
            />
            <GradientButton
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
            />
          </View>
        </View>

        {/* Account Information */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.headerIcon}
            >
              <Ionicons name="information-circle" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Account Information
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                Your account details and status
              </Text>
            </View>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Date Joined
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {userProfile?.joinDate
                  ? new Date(userProfile.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Loading..."}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Account Status
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        userProfile?.status === "active"
                          ? colors.success
                          : userProfile?.status === "suspended"
                            ? colors.warning
                            : colors.error,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        userProfile?.status === "active"
                          ? colors.success
                          : userProfile?.status === "suspended"
                            ? colors.warning
                            : colors.error,
                    },
                  ]}
                >
                  {userProfile?.status
                    ? userProfile.status.charAt(0).toUpperCase() +
                      userProfile.status.slice(1)
                    : "Loading..."}
                </Text>
              </View>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Verification Status
              </Text>
              <View style={styles.statusRow}>
                <Ionicons
                  name={
                    userProfile?.isVerified
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={16}
                  color={
                    userProfile?.isVerified ? colors.success : colors.error
                  }
                />
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: userProfile?.isVerified
                        ? colors.success
                        : colors.error,
                    },
                  ]}
                >
                  {userProfile?.isVerified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={styles.themeRow}>
            <View
              style={[
                styles.themeIcon,
                {
                  backgroundColor: isDark
                    ? `${colors.blue}20`
                    : `${colors.warning}20`,
                },
              ]}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={isDark ? colors.blue : colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                {isDark ? "Switch to light theme" : "Switch to dark theme"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                toggleTheme();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: colors.border, true: colors.purple }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: pressed
                ? `${colors.error}25`
                : `${colors.error}12`,
              borderColor: `${colors.error}35`,
            },
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      {/* Reset PIN verify overlay */}
      {showResetPin && (
        <View style={styles.overlay}>
          <View style={[styles.verifyCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
              Verify Password
            </Text>
            <Text style={[styles.verifySub, { color: colors.textMuted }]}>
              Enter your account password to reset PIN
            </Text>
            <Input
              label="Password"
              placeholder="Enter your account password"
              value={verifyPassword}
              onChangeText={setVerifyPassword}
              isPassword
            />
            <View style={styles.verifyBtns}>
              <GradientButton
                title="Verify & Reset"
                onPress={handleVerifyForPinReset}
                loading={loading}
                style={{ flex: 1 }}
              />
              <GradientButton
                title="Cancel"
                onPress={() => {
                  setShowResetPin(false);
                  setVerifyPassword("");
                }}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Set Transaction PIN Modal */}
      {showSetPin && (
        <View style={styles.overlay}>
          <View style={[styles.verifyCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
              Set Transaction PIN
            </Text>
            <Text style={[styles.verifySub, { color: colors.textMuted }]}>
              Create a 4-digit PIN for transactions
            </Text>
            <Input
              label="New PIN"
              placeholder="Enter 4-digit PIN"
              value={pinForm.newPin}
              onChangeText={(v) => setPinForm((f) => ({ ...f, newPin: v }))}
              keyboardType="numeric"
              maxLength={4}
              isPassword
            />
            <Input
              label="Confirm PIN"
              placeholder="Confirm your PIN"
              value={pinForm.confirmPin}
              onChangeText={(v) => setPinForm((f) => ({ ...f, confirmPin: v }))}
              keyboardType="numeric"
              maxLength={4}
              isPassword
            />
            <View style={styles.verifyBtns}>
              <GradientButton
                title="Set PIN"
                onPress={handleSetTransactionPin}
                loading={loading}
                style={{ flex: 1 }}
              />
              <GradientButton
                title="Cancel"
                onPress={() => {
                  setShowSetPin(false);
                  setPinForm({ newPin: "", confirmPin: "" });
                }}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Reset Transaction PIN Modal */}
      {showPinModal && (
        <View style={styles.overlay}>
          <View style={[styles.verifyCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
              Reset Transaction PIN
            </Text>
            <Text style={[styles.verifySub, { color: colors.textMuted }]}>
              Enter your new 4-digit PIN
            </Text>
            <Input
              label="New PIN"
              placeholder="Enter 4-digit PIN"
              value={pinForm.newPin}
              onChangeText={(v) => setPinForm((f) => ({ ...f, newPin: v }))}
              keyboardType="numeric"
              maxLength={4}
              isPassword
            />
            <Input
              label="Confirm PIN"
              placeholder="Confirm your PIN"
              value={pinForm.confirmPin}
              onChangeText={(v) => setPinForm((f) => ({ ...f, confirmPin: v }))}
              keyboardType="numeric"
              maxLength={4}
              isPassword
            />
            <View style={styles.verifyBtns}>
              <GradientButton
                title="Reset PIN"
                onPress={handleSetTransactionPin}
                loading={loading}
                style={{ flex: 1 }}
              />
              <GradientButton
                title="Cancel"
                onPress={() => {
                  setShowPinModal(false);
                  setPinForm({ newPin: "", confirmPin: "" });
                }}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}

      {result && (
        <ResultModal
          visible={!!result}
          type={result.type}
          title={result.title}
          message={result.message}
          onClose={() => setResult(null)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <View style={styles.overlay}>
          <View style={[styles.verifyCard, { backgroundColor: colors.bgCard }]}>
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: `${colors.error}25`,
                  alignSelf: "center",
                  marginBottom: 16,
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </View>
            <Text
              style={[
                styles.verifyTitle,
                { color: colors.textPrimary, textAlign: "center" },
              ]}
            >
              Confirm Logout
            </Text>
            <Text
              style={[
                styles.verifySub,
                { color: colors.textMuted, textAlign: "center" },
              ]}
            >
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </Text>
            <View style={styles.verifyBtns}>
              <GradientButton
                title="Cancel"
                onPress={() => setShowLogoutConfirm(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <GradientButton
                title="Logout"
                onPress={confirmLogout}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_400Regular", marginBottom: 24 },
  card: {
    borderRadius: 18,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  cardSubtitle: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  form: { gap: 14 },
  securityList: {},
  secItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  secItemTitle: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  secItemSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  divider: { height: 1 },
  infoList: { gap: 14 },
  infoItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoLabel: { fontSize: 12, fontFamily: "Nunito_400Regular", flex: 1 },
  infoValue: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  statusRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  themeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontFamily: "Nunito_700Bold" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 100,
  },
  verifyCard: { borderRadius: 24, padding: 24, width: "100%", gap: 14 },
  verifyTitle: { fontSize: 20, fontFamily: "Nunito_700Bold" },
  verifySub: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  verifyBtns: { flexDirection: "row", gap: 10 },
});
