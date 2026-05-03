import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetInfoStore } from "@/store/netInfoStore";
import { useColors } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

interface OfflineModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export function OfflineModal({ visible, onClose }: OfflineModalProps) {
  const { isOfflineModalVisible, hideOfflineModal } = useNetInfoStore();
  const colors = useColors();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  const modalVisible = visible !== undefined ? visible : isOfflineModalVisible;

  React.useEffect(() => {
    if (modalVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [modalVisible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) {
        onClose();
      } else {
        hideOfflineModal();
      }
    });
  };

  return (
    <Modal
      transparent
      visible={modalVisible}
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
          {/* No Internet Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.internet}15` },
            ]}
          >
            <Ionicons name="wifi-outline" size={48} color={colors.internet} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            No Internet Connection
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Please check your internet connection and try again
          </Text>

          {/* Try Again Button */}
          <Pressable
            style={[styles.button, { backgroundColor: colors.internet }]}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
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
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
});
