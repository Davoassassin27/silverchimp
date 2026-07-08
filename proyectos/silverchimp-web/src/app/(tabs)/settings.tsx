import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { GradientView } from '@/components/gradient-view';
import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Spacing,
  getGradient,
} from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const events = useEventStore((s) => s.events);
  const heroColors = getGradient('hero', scheme) as unknown as readonly [string, string];

  const totalCategories = events.reduce((acc, e) => acc + e.categories.length, 0);
  const totalAthletes = events.reduce(
    (acc, e) => acc + e.categories.reduce((cacc, c) => cacc + c.athletes.length, 0),
    0
  );

  function wipeStorage() {
    Alert.alert(
      'Borrar todo',
      'Seguro? Esto elimina todos los eventos, categorias y atletas guardados localmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => useEventStore.setState({ events: [] }),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GradientView
          colors={heroColors}
          direction="diagonal-down"
          borderRadius={Radius.xl}
          style={styles.hero}
        >
          <Logo size={72} />
          <View>
            <ThemedText type="display" style={{ color: '#FFFFFF' }}>
              SilverChimp
            </ThemedText>
            <ThemedText type="caption" style={{ color: '#FFFFFFAA', marginTop: 2 }}>
              MVP - v1.0.0
            </ThemedText>
          </View>
        </GradientView>

        <Card variant="elevated" style={{ gap: Spacing.two }}>
          <ThemedText type="micro" themeColor="textSecondary">DATOS LOCALES</ThemedText>
          <Row label="Eventos guardados" value={events.length} />
          <Row label="Categorias" value={totalCategories} />
          <Row label="Atletas" value={totalAthletes} />
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
            Persistencia: AsyncStorage (offline-first). Los datos viven en el dispositivo.
          </ThemedText>
        </Card>

        <Card variant="elevated" style={{ gap: Spacing.two }}>
          <ThemedText type="micro" themeColor="textSecondary">STACK</ThemedText>
          <ThemedText type="body">Expo - React Native - TypeScript</ThemedText>
          <ThemedText type="body">Zustand - Zod - AsyncStorage</ThemedText>
          <ThemedText type="body">Silverchimp Recap (Remotion)</ThemedText>
        </Card>

        <Button
          label="Borrar datos locales"
          variant="danger"
          onPress={wipeStorage}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        { borderColor: theme.hairline },
      ]}
    >
      <ThemedText type="body">{label}</ThemedText>
      <ThemedText type="h2">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
  },
});
