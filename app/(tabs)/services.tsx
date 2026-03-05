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
import { useColors } from '@/hooks/useTheme';
import { AppHeader } from '@/components/ui/AppHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { AirtimeModal } from '@/components/services/AirtimeModal';
import { DataModal } from '@/components/services/DataModal';
import { ElectricityModal } from '@/components/services/ElectricityModal';
import { CableModal } from '@/components/services/CableModal';

type ServiceType = 'airtime' | 'data' | 'electricity' | 'cable' | 'bills' | 'internet' | null;

const SERVICES = [
  { id: 'airtime', icon: 'phone-portrait', lib: 'ionicons', colorKey: 'airtime', title: 'Airtime Top-up', subtitle: 'Buy airtime for all networks' },
  { id: 'data', icon: 'wifi', lib: 'feather', colorKey: 'data', title: 'Data Bundles', subtitle: 'Purchase data plans for all networks' },
  { id: 'electricity', icon: 'flash', lib: 'ionicons', colorKey: 'electricity', title: 'Electricity Bills', subtitle: 'Pay for PHCN, EKEDC, IKEDC & more' },
  { id: 'cable', icon: 'tv-outline', lib: 'ionicons', colorKey: 'cable', title: 'Cable TV', subtitle: 'DSTV, GOtv, Startimes subscriptions' },
  { id: 'bills', icon: 'receipt-outline', lib: 'ionicons', colorKey: 'bills', title: 'Bill Payments', subtitle: 'Pay utility bills with ease' },
  { id: 'internet', icon: 'globe-outline', lib: 'ionicons', colorKey: 'internet', title: 'Internet Services', subtitle: 'Spectranet, Smile & more' },
];

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeModal, setActiveModal] = useState<ServiceType>(null);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <AppHeader />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Services</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose a service to get started</Text>

        <View style={styles.list}>
          {SERVICES.map((svc) => {
            const svcColor = (colors as any)[svc.colorKey];
            return (
              <View key={svc.id} style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: `${svcColor}20` }]}>
                    {svc.lib === 'feather' ? (
                      <Feather name={svc.icon as any} size={24} color={svcColor} />
                    ) : (
                      <Ionicons name={svc.icon as any} size={24} color={svcColor} />
                    )}
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{svc.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>{svc.subtitle}</Text>
                  </View>
                </View>
                <GradientButton
                  title="Select Service"
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setActiveModal(svc.id as ServiceType); }}
                />
              </View>
            );
          })}
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
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  list: { gap: 14 },
  card: { borderRadius: 18, padding: 20, gap: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold' },
  cardSubtitle: { fontSize: 13, fontFamily: 'Nunito_400Regular', lineHeight: 20 },
});
