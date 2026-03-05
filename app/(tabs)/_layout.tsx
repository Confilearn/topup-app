import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useTheme';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="services">
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
        <Label>Services</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add-money">
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
        <Label>Add Money</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions">
        <Icon sf={{ default: 'clock.arrow.circlepath', selected: 'clock.arrow.circlepath' }} />
        <Label>History</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'person.circle', selected: 'person.circle.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  const TAB_HEIGHT = 60;
  const BOTTOM_INSET = isWeb ? 34 : insets.bottom;

  const TABS = [
    { name: 'dashboard', icon: 'home', activeIcon: 'home', label: 'Home' },
    { name: 'services', icon: 'grid-outline', activeIcon: 'grid', label: 'Services' },
    { name: 'add-money', icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Add Money' },
    { name: 'transactions', icon: 'time-outline', activeIcon: 'time', label: 'History' },
    { name: 'settings', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: TAB_HEIGHT + BOTTOM_INSET,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <>
            {isIOS ? (
              <BlurView
                intensity={90}
                tint={colors.bgPrimary === '#080818' ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, styles.tabBarBg]}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.tabBarBg,
                  {
                    backgroundColor: colors.bgCard,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  },
                ]}
              />
            )}
          </>
        ),
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarLabel: () => null,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <View style={styles.tabItem}>
                <View
                  style={[
                    styles.tabIconWrap,
                    focused && { backgroundColor: `${colors.purple}20` },
                  ]}
                >
                  <Ionicons
                    name={(focused ? tab.activeIcon : tab.icon) as any}
                    size={22}
                    color={focused ? colors.purple : colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? colors.purple : colors.textMuted },
                    focused && { fontFamily: 'Nunito_700Bold' },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabBarBg: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
  },
});
