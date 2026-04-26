import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";

interface CopyModalProps {
  visible: boolean;
  onClose: () => void;
  copiedText: string;
}

export const CopyModal: React.FC<CopyModalProps> = ({
  visible,
  onClose,
  copiedText,
}) => {
  const colors = useColors();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Copy Icon with checkmark */}
          <View style={[styles.iconContainer, { backgroundColor: `${colors.purple}15` }]}>
            <Ionicons name="checkmark-done" size={36} color={colors.purple} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Copied Successfully!
          </Text>

          {/* Copied Text Preview */}
          <View style={[styles.copiedTextContainer, { backgroundColor: colors.bgCardAlt }]}>
            <Text style={[styles.copiedText, { color: colors.textSecondary }]}>
              {copiedText}
            </Text>
          </View>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Account number copied to clipboard
          </Text>

          {/* Close Button */}
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.purple }]}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Got it</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    maxWidth: 300,
    width: "100%",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginBottom: 12,
  },
  copiedTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
  },
  copiedText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  closeButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
  },
  closeButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
});
