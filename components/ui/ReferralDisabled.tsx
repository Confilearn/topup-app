import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";

interface ReferralDisabledProps {
  message?: string;
}

/**
 * ReferralDisabled Component
 * 
 * Shows a friendly message when referral features are disabled by admin
 * Matches the design and messaging from the web version
 */
export const ReferralDisabled: React.FC<ReferralDisabledProps> = ({ 
  message 
}) => {
  const colors = useColors();

  const defaultMessage = "Referral features are currently disabled. Please check back later.";

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${colors.textMuted}20` }]}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color={colors.textMuted} 
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Referral Features Disabled
        </Text>

        {/* Message */}
        <Text style={[styles.message, { color: colors.textMuted }]}>
          {message || defaultMessage}
        </Text>

        {/* Additional help text */}
        <Text style={[styles.helpText, { color: colors.textMuted }]}>
          Please check back later or contact support if you have any questions.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ReferralDisabled;
