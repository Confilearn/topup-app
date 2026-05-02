import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNetInfoStore } from "@/store/netInfoStore";

const { width } = Dimensions.get("window");

interface OfflineModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export function OfflineModal({ visible, onClose }: OfflineModalProps) {
  const { isOfflineModalVisible, hideOfflineModal } = useNetInfoStore();

  const modalVisible = visible !== undefined ? visible : isOfflineModalVisible;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      hideOfflineModal();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="fade"
      statusBarTranslucent={true}
    >
      {/* Background Overlay */}
      <View style={styles.overlay}>
        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {/* No Internet Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📵</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>No Internet Connection</Text>

          {/* Description */}
          <Text style={styles.description}>
            Please check your internet connection and try again
          </Text>

          {/* Try Again Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
