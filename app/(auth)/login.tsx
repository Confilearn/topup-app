import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/themeStore";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useThemeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error: authError, clearError } = useAuthStore();

  const handleLogin = async () => {
    // Clear any existing errors
    setError("");
    clearError();

    // Validate email format
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Login successful - navigate to dashboard
        router.replace("/(tabs)/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
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
            <Pressable
              onPress={() => router.push("/(auth)/signup")}
              style={styles.iconBtn}
            >
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sign in to your account to continue
            </Text>

            <View style={styles.form}>
              {/* Show auth store errors or local errors */}
              {authError || error ? (
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
                    {authError || error}
                  </Text>
                </View>
              ) : null}

              <Input
                label="Email"
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.border,
                        backgroundColor: rememberMe
                          ? colors.purple
                          : "transparent",
                      },
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text
                    style={[styles.rememberMeText, { color: colors.textMuted }]}
                  >
                    Remember me
                  </Text>
                </TouchableOpacity>

                <Pressable
                  onPress={() => router.push("/(auth)/forgot-password")}
                  style={styles.forgotBtn}
                >
                  <Text
                    style={[styles.forgotText, { color: colors.purpleLight }]}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
              </View>

              <GradientButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading || isLoading}
                disabled={loading || isLoading}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Don't have an account?{" "}
                </Text>
                <Pressable onPress={() => router.push("/(auth)/signup")}>
                  <Text
                    style={[styles.footerLink, { color: colors.purpleLight }]}
                  >
                    Sign up
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 22, fontFamily: "Nunito_800ExtraBold" },
  card: { borderRadius: 24, padding: 28, borderWidth: 1 },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_400Regular", marginBottom: 24 },
  form: { gap: 16 },
  errorBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Nunito_500Medium", flex: 1 },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberMeText: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Nunito_700Bold" },
});
