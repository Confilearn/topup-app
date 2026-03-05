import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { GradientButton } from '@/components/ui/GradientButton';
import { AirtimeModal } from '@/components/services/AirtimeModal';
import { DataModal } from '@/components/services/DataModal';
import { ElectricityModal } from '@/components/services/ElectricityModal';
import { CableModal } from '@/components/services/CableModal';

type ServiceType = 'airtime' | 'data' | 'electricity' | 'cable' | 'bills' | 'internet' | null;

const SERVICES = [
  {
    id: 'airtime',
    icon: 'phone-portrait',
    iconLib: 'ionicons',
    color: COLORS.airtime,
    title: 'Airtime Top-up',
    subtitle: 'Buy airtime for all networks',
  },
  {
    id: 'data',
    icon: 'wifi',
    iconLib: 'feather',
    color: COLORS.data,
    title: 'Data Bundles',
    subtitle: 'Purchase data plans for all networks',
  },
  {
    id: 'electricity',
    icon: 'flash',
    iconLib: 'ionicons',
    color: COLORS.electricity,
    title: 'Electricity Bills',
    subtitle: 'Pay for PHCN, EKEDC, IKEDC & more',
  },
  {
    id: 'cable',
    icon: 'tv-outline',
    iconLib: 'ionicons',
    color: COLORS.cable,
    title: 'Cable TV',
    subtitle: 'DSTV, GOtv, Startimes subscriptions',
  },
  {
    id: 'bills',
    icon: 'receipt-outline',
    iconLib: 'ionicons',
    color: COLORS.bills,
    title: 'Bill Payments',
    subtitle: 'Pay utility bills with ease',
  },
  {
    id: 'internet',
    icon: 'globe-outline',
    iconLib: 'ionicons',
    color: COLORS.internet,
    title: 'Internet Services',
    subtitle: 'Spectranet, Smile & more',
  },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const [activeModal, setActiveModal] = useState<ServiceType>(null);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveModal(id as ServiceType);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable>
            <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.brandName}>TopupAfrica</Text>
          <Pressable>
            <Ionicons name="sunny" size={22} color={COLORS.warning} />
          </Pressable>
        </View>

        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Choose a service to get started</Text>

        <View style={styles.list}>
          {SERVICES.map((svc) => (
            <View key={svc.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: `${svc.color}20` }]}>
                  {svc.iconLib === 'feather' ? (
                    <Feather name={svc.icon as any} size={24} color={svc.color} />
                  ) : (
                    <Ionicons name={svc.icon as any} size={24} color={svc.color} />
                  )}
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{svc.title}</Text>
                  <Text style={styles.cardSubtitle}>{svc.subtitle}</Text>
                </View>
              </View>
              <GradientButton
                title="Select Service"
                onPress={() => handleSelect(svc.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <AirtimeModal visible={activeModal === 'airtime'} onClose={() => setActiveModal(null)} />
      <DataModal visible={activeModal === 'data'} onClose={() => setActiveModal(null)} />
      <ElectricityModal visible={activeModal === 'electricity'} onClose={() => setActiveModal(null)} />
      <CableModal visible={activeModal === 'cable'} onClose={() => setActiveModal(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandName: { color: COLORS.purple, fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: COLORS.textPrimary, fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  list: { gap: 14 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 17, fontFamily: 'Nunito_700Bold' },
  cardSubtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', lineHeight: 20 },
});
