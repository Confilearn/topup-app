import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/themeStore";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { ResultModal } from "@/components/services/ResultModal";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useThemeStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const { forgotPassword } = useAuthStore();

  const handleForgotPassword = async () => {
    // Clear previous errors
    setError("");

    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const success = await forgotPassword(email);
      if (success) {
        setShowResult(true);
      }
      // If success is false (offline), don't show success modal
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      mode="margin"
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
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
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.purple}20` },
            ]}
          >
            <Ionicons name="mail-unread" size={48} color={colors.purple} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </Text>

          <View style={styles.form}>
            {/* Error Message */}
            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: `${colors.error}20`,
                    borderColor: `${colors.error}40`,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <GradientButton
              title="Send Reset Link"
              onPress={handleForgotPassword}
              loading={loading}
              disabled={loading || !email}
            />

            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text
                style={[styles.backLinkText, { color: colors.purpleLight }]}
              >
                ← Back to Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ResultModal
        visible={showResult}
        type="success"
        title="Reset Link Sent!"
        message={`We've sent a password reset link to ${email}. Please check your email and click the link to reset your password.`}
        onClose={() => {
          setShowResult(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
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
  backLink: { alignItems: "center", paddingVertical: 12 },
  backLinkText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
});
