import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";

interface EmptyTransactionStateProps {
  type?: "all" | "recent" | "filtered";
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * EmptyTransactionState component - Displays empty state for transaction lists
 * Follows clean coding practices with comprehensive commenting
 */
export const EmptyTransactionState: React.FC<EmptyTransactionStateProps> = ({
  type = "all",
  message,
  icon = "receipt-outline",
}) => {
  const colors = useColors();

  // Get appropriate message based on type
  const getDefaultMessage = () => {
    switch (type) {
      case "recent":
        return "No recent transactions";
      case "filtered":
        return "No transactions found";
      case "all":
      default:
        return "No transactions yet";
    }
  };

  // Get appropriate subtitle based on type
  const getDefaultSubtitle = () => {
    switch (type) {
      case "recent":
        return "Your recent transactions will appear here";
      case "filtered":
        return "Try adjusting your search or filter criteria";
      case "all":
      default:
        return "Start making transactions to see your history here";
    }
  };

  const displayMessage = message || getDefaultMessage();
  const displaySubtitle = getDefaultSubtitle();

  return (
    <View style={styles.container}>
      {/* Empty State Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.textMuted}15` },
        ]}
      >
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>

      {/* Empty State Message */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {displayMessage}
      </Text>

      {/* Empty State Subtitle */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {displaySubtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
});

export default EmptyTransactionState;
