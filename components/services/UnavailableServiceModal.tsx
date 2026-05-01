import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";

interface UnavailableServiceModalProps {
  visible: boolean;
  onClose: () => void;
  serviceName: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function UnavailableServiceModal({
  visible,
  onClose,
  serviceName,
}: UnavailableServiceModalProps) {
  const colors = useColors();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.centerContainer, { backgroundColor: colors.bgCard }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.purple}20` },
            ]}
          >
            <Ionicons name="time-outline" size={48} color={colors.purple} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontFamily: "Nunito_800ExtraBold",
                },
              ]}
            >
              {serviceName}
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.textMuted, fontFamily: "Nunito_400Regular" },
              ]}
            >
              Service currently unavailable
            </Text>

            <Text
              style={[
                styles.message,
                {
                  color: colors.textSecondary,
                  fontFamily: "Nunito_400Regular",
                },
              ]}
            >
              We're working hard to bring this service to you soon!
            </Text>
          </View>

          {/* Close Button */}
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: colors.purple,
                opacity: pressed ? 0.8 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [],
              },
            ]}
            onPress={handleClose}
          >
            <Text
              style={[
                styles.closeButtonText,
                { fontFamily: "Nunito_600SemiBold" },
              ]}
            >
              Got it
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    width: "85%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  closeButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
