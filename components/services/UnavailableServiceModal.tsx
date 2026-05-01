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
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bgCard }]}>
          {/* Gradient Header */}
          <LinearGradient
            colors={["#FF6B6B", "#FF8E53"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={48} color="white" />
            </View>
            <Text style={styles.serviceName}>{serviceName}</Text>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            <View style={[styles.messageBox, { backgroundColor: colors.bgSecondary }]}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.textMuted}
                style={styles.infoIcon}
              />
              <Text style={[styles.message, { color: colors.textPrimary }]}>
                Service Currently Unavailable
              </Text>
              <Text style={[styles.subMessage, { color: colors.textMuted }]}>
                We're working hard to bring {serviceName.toLowerCase()} services to you. 
                This feature will be available soon!
              </Text>
            </View>

            <View style={styles.features}>
              <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>
                What to expect:
              </Text>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.featureIcon}
                />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Easy and secure payments
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.featureIcon}
                />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Instant service delivery
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.featureIcon}
                />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  24/7 customer support
                </Text>
              </View>
            </View>

            <Text style={[styles.updateText, { color: colors.textMuted }]}>
              Stay tuned for updates! We'll notify you when this service is live.
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
            <Text style={styles.closeButtonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    padding: 32,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  content: {
    padding: 24,
    gap: 20,
  },
  messageBox: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    marginBottom: 4,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  features: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  updateText: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  closeButton: {
    margin: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
