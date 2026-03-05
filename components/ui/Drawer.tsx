import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useThemeStore } from '@/store/themeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: 'home-outline', label: 'Dashboard', route: '/(tabs)/dashboard' },
  { icon: 'grid-outline', label: 'Services', route: '/(tabs)/services' },
  { icon: 'wallet-outline', label: 'Add Money', route: '/(tabs)/add-money' },
  { icon: 'list-outline', label: 'Transactions', route: '/(tabs)/transactions' },
  { icon: 'people-outline', label: 'Referrals', route: '/(tabs)/referrals' },
  { icon: 'person-outline', label: 'Profile & Settings', route: '/(tabs)/settings' },
];

export function Drawer({ visible, onClose }: DrawerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { balance } = useWalletStore();
  const { isDark, toggleTheme } = useThemeStore();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const navigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => router.push(route as any), 250);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onClose();
    setTimeout(() => {
      logout();
      router.replace('/(auth)/login');
    }, 250);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        {/* Backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer panel */}
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.bgCard,
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0),
              paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0),
            },
          ]}
        >
          {/* User Profile */}
          <LinearGradient
            colors={['#7C3AED', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileSection}
          >
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.balancePill}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.balanceText}>₦{balance.toFixed(2)}</Text>
            </View>
          </LinearGradient>

          {/* Nav Items */}
          <View style={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.navItem,
                  { backgroundColor: pressed ? `${colors.purple}15` : 'transparent' },
                ]}
                onPress={() => navigate(item.route)}
              >
                <View style={[styles.navIcon, { backgroundColor: `${colors.purple}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.purple} />
                </View>
                <Text style={[styles.navLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Theme Toggle */}
          <View style={styles.themeRow}>
            <View style={[styles.navIcon, { backgroundColor: `${colors.purple}15` }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.blue : colors.warning} />
            </View>
            <Text style={[styles.navLabel, { color: colors.textPrimary }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={isDark}
              onValueChange={() => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ false: colors.border, true: colors.purple }}
              thumbColor="#fff"
            />
          </View>

          {/* Logout */}
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, { backgroundColor: pressed ? `${colors.error}20` : `${colors.error}10` }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 24,
    gap: 6,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  userName: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  balanceText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  navList: {
    padding: 12,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
});
