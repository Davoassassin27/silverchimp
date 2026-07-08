import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  TypeScale,
  getGradient,
} from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import { LIFT_LABEL, type LiftKind } from '@/domain/schema';
import { bestLift, formatKg } from '@/domain/scoring';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const events = useEventStore((s) => s.events);
  const ready = useEventStore((s) => s.ready);

  const latest = events[0];
  const best: Record<LiftKind, number> = { squat: 0, bench: 0, deadlift: 0 };
  if (latest) {
    for (const c of latest.categories) {
      for (const a of c.athletes) {
        const s = bestLift(a.squat);
        const b = bestLift(a.bench);
        const d = bestLift(a.deadlift);
        if (s > best.squat) best.squat = s;
        if (b > best.bench) best.bench = b;
        if (d > best.deadlift) best.deadlift = d;
      }
    }
  }

  const heroColors = getGradient('hero', scheme) as unknown as readonly [string, string];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GradientView
          colors={heroColors}
          direction="diagonal-down"
          borderRadius={Radius.xl}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Logo size={56} />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="h1"
                style={{ color: '#FFFFFF' }}
              >
                SilverChimp
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: '#FFFFFFCC', marginTop: 2 }}
              >
                Powerlifting tracker
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroStats}>
            <HeroStat label="Eventos" value={String(events.length)} />
            <View style={styles.divider} />
            <HeroStat
              label="Atletas"
              value={String(
                events.reduce(
                  (acc, e) => acc + e.categories.reduce((cacc, c) => cacc + c.athletes.length, 0),
                  0
                )
              )}
            />
            <View style={styles.divider} />
            <HeroStat
              label="Categorias"
              value={String(events.reduce((acc, e) => acc + e.categories.length, 0))}
            />
          </View>
        </GradientView>

        {!ready ? (
          <ThemedText type="body" style={{ textAlign: 'center', marginTop: Spacing.six }}>
            Cargando...
          </ThemedText>
        ) : events.length === 0 ? (
          <Card variant="elevated" style={{ gap: Spacing.one }}>
            <ThemedText type="h2">Sin competencias todavia</ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={{ marginTop: Spacing.one, marginBottom: Spacing.three }}>
              Crea tu primer evento para empezar a registrar atletas y tiros.
            </ThemedText>
            <Button label="Nuevo evento" onPress={() => router.push({ pathname: '/events' })} />
          </Card>
        ) : (
          <>
            <Pressable onPress={() => latest && router.push({ pathname: '/event/[id]', params: { id: latest.id } })}>
              <Card variant="gradient" gradientKey="accent" style={{ gap: Spacing.two }}>
                <ThemedText
                  type="micro"
                  style={{ color: '#FFFFFFCC' }}
                >
                  ULTIMO EVENTO
                </ThemedText>
                <ThemedText type="h1" style={{ color: '#FFFFFF' }}>
                  {latest.name}
                </ThemedText>
                <ThemedText type="body" style={{ color: '#FFFFFFE5' }}>
                  {latest.startDate} - {latest.endDate}
                  {latest.federation ? ' - ' + latest.federation : ''}
                </ThemedText>
                <View style={styles.metaRow}>
                  <Pill label={latest.categories.length + ' categorias'} light />
                  <Pill
                    label={latest.categories.reduce((acc, c) => acc + c.athletes.length, 0) + ' atletas'}
                    accent
                  />
                </View>
              </Card>
            </Pressable>

            <View style={styles.row}>
              {(['squat', 'bench', 'deadlift'] as LiftKind[]).map((lift) => (
                <LiftStat key={lift} lift={lift} value={best[lift]} />
              ))}
            </View>
          </>
        )}

        {events.length > 0 ? (
          <Pressable
            style={{ marginTop: Spacing.three }}
            onPress={() => router.push({ pathname: '/events' })}
          >
            <ThemedText type="linkPrimary" style={TypeScale.bodyStrong as any}>
              {'Ver todos los eventos ' + String.fromCharCode(8594)}
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <ThemedText type="h1" style={{ color: '#FFFFFF' }}>{value}</ThemedText>
      <ThemedText type="micro" style={{ color: '#FFFFFFAA' }}>{label.toUpperCase()}</ThemedText>
    </View>
  );
}

function LiftStat({ lift, value }: { lift: LiftKind; value: number }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = getGradient(lift, scheme) as unknown as readonly [string, string];
  return (
    <GradientView
      colors={colors}
      direction="diagonal-down"
      borderRadius={Radius.lg}
      style={{ flex: 1, padding: Spacing.three, alignItems: 'center', gap: 2, minHeight: 96 }}
    >
      <ThemedText type="micro" style={{ color: '#FFFFFFCC' }}>{LIFT_LABEL[lift].toUpperCase()}</ThemedText>
      <ThemedText type="display" style={{ color: '#FFFFFF' }}>{formatKg(value)}</ThemedText>
      <ThemedText type="micro" style={{ color: '#FFFFFF99' }}>mejor</ThemedText>
    </GradientView>
  );
}

function Pill({ label, accent, light }: { label: string; accent?: boolean; light?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        borderRadius: 999,
        backgroundColor: accent
          ? '#FFFFFF'
          : light
            ? 'rgba(255,255,255,0.18)'
            : theme.backgroundSelected,
      }}
    >
      <ThemedText
        type="micro"
        style={{
          color: accent ? theme.accent : '#FFFFFF',
          fontWeight: '800',
        }}
      >
        {label}
      </ThemedText>
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
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  row: { flexDirection: 'row', gap: Spacing.two },
  metaRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginTop: Spacing.one },
});
