import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/themeStore";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { useAuthStore } from "@/store/authStore";

export default function SignupScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useThemeStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signup } = useAuthStore();

  const handleSignup = async () => {
    // Validate required fields
    if (
      !form.firstName ||
      !form.lastName ||
      !form.username ||
      !form.email ||
      !form.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength (matches server requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, and number",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Map form data to match server expectations
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        referredBy: form.referralCode || undefined,
      };

      const success = await signup(userData);

      if (success) {
        // Show success message and redirect to login
        setSuccess(true);

        // Wait a moment to show success message before redirect
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
        },
      ]}
    >
      {colors.bgPrimary === "#080818" && (
        <LinearGradient
          colors={["#0A0A1A", "#0E0E2A", "#080818"]}
          style={StyleSheet.absoluteFill}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
            <Text style={[styles.brand, { color: colors.purple }]}>
              TopupAfrica
            </Text>
            <Pressable onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={22}
                color={isDark ? colors.warning : colors.textMuted}
              />
            </Pressable>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Join thousands of users and start using our VTU services today
            </Text>

            <View style={styles.form}>
              {/* Success Message */}
              {success ? (
                <View
                  style={[
                    styles.successBanner,
                    {
                      backgroundColor: `${colors.success}20`,
                      borderColor: `${colors.success}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text style={[styles.successText, { color: colors.success }]}>
                    Account created successfully! Redirecting to login...
                  </Text>
                </View>
              ) : null}

              {/* Error Message */}
              {error && !success ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: `${colors.error}20`,
                      borderColor: `${colors.error}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={form.firstName}
                    onChangeText={(v) => update("firstName", v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={form.lastName}
                    onChangeText={(v) => update("lastName", v)}
                  />
                </View>
              </View>
              <Input
                label="Username"
                placeholder="johndoe"
                value={form.username}
                onChangeText={(v) => update("username", v)}
                autoCapitalize="none"
              />
              <Input
                label="Email"
                placeholder="john@example.com"
                value={form.email}
                onChangeText={(v) => update("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone Number"
                placeholder="+234 123 456 7890"
                value={form.phone}
                onChangeText={(v) => update("phone", v)}
                keyboardType="phone-pad"
              />
              <Input
                label="Password"
                placeholder="Create a strong password"
                value={form.password}
                onChangeText={(v) => update("password", v)}
                isPassword
              />
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChangeText={(v) => update("confirmPassword", v)}
                isPassword
              />
              <Input
                label="Referral Code (Optional)"
                placeholder="Enter referral code"
                value={form.referralCode}
                onChangeText={(v) => update("referralCode", v)}
                autoCapitalize="characters"
              />

              <GradientButton
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                disabled={loading || success}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Already have an account?{" "}
                </Text>
                <Pressable onPress={() => router.back()}>
                  <Text
                    style={[styles.footerLink, { color: colors.purpleLight }]}
                  >
                    Sign in
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 22, fontFamily: "Nunito_800ExtraBold" },
  card: { borderRadius: 24, padding: 28, borderWidth: 1 },
  title: { fontSize: 26, fontFamily: "Nunito_800ExtraBold", marginBottom: 6 },
  subtitle: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginBottom: 24,
    lineHeight: 20,
  },
  form: { gap: 14 },
  row: { flexDirection: "row", gap: 12 },
  errorBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Nunito_500Medium", flex: 1 },
  successBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  successText: { fontSize: 13, fontFamily: "Nunito_500Medium", flex: 1 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Nunito_700Bold" },
});
