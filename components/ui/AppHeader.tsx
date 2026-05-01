import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/themeStore";
import { Drawer } from "@/components/ui/Drawer";

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function AppHeader({ showBack, onBack }: AppHeaderProps) {
  const colors = useColors();
  const { isDark, toggleTheme } = useThemeStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <Pressable onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={colors.textPrimary} />
          </Pressable>
        )}
        <Text style={[styles.brand, { color: colors.purple }]}>
          TopupAfrica
        </Text>
        <Pressable onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={22}
            color={isDark ? "#F59E0B" : colors.textMuted}
          />
        </Pressable>
      </View>

      <Drawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
  },
});
