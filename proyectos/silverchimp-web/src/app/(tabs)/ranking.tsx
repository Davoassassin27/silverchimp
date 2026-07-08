import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing, TypeScale } from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import { rankAthletes, formatKg } from '@/domain/scoring';
import { useTheme } from '@/hooks/use-theme';

export default function RankingScreen() {
  const theme = useTheme();
  const events = useEventStore((s) => s.events);
  const ready = useEventStore((s) => s.ready);

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: Spacing.four }}>
          <ThemedText type="body" themeColor="textSecondary">Cargando...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="display" style={{ marginBottom: Spacing.two }}>
            Ranking
          </ThemedText>
          <Card variant="elevated">
            <ThemedText type="body" themeColor="textSecondary">
              Sin eventos. Crea un evento con atletas para ver el ranking en vivo.
            </ThemedText>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={{ marginBottom: Spacing.one }}>
          Ranking en vivo
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
          Empate en total: gana el de menor peso corporal.
        </ThemedText>

        {events.map((ev) => (
          <View key={ev.id} style={{ gap: Spacing.two, marginBottom: Spacing.three }}>
            <Pressable onPress={() => router.push({ pathname: '/event/[id]', params: { id: ev.id } })}>
              <View style={{ marginBottom: Spacing.two }}>
                <ThemedText type="h2" style={{ color: theme.accent }}>{ev.name}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {ev.startDate + ' - ' + ev.endDate}
                </ThemedText>
              </View>
            </Pressable>

            {ev.categories.length === 0 ? (
              <Card>
                <ThemedText type="body" themeColor="textSecondary">Sin categorias.</ThemedText>
              </Card>
            ) : (
              ev.categories.map((c) => {
                const ranked = rankAthletes(c.athletes).slice(0, 5);
                return (
                  <Card key={c.id} variant="elevated" style={{ gap: Spacing.two }}>
                    <Pressable onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}>
                      <View style={styles.catHead}>
                        <ThemedText type="h2">{c.name}</ThemedText>
                        <ThemedText type="caption" themeColor="textSecondary">
                          {c.athletes.length} atletas {'>'}
                        </ThemedText>
                      </View>
                    </Pressable>
                    {ranked.length === 0 ? (
                      <ThemedText type="caption" themeColor="textSecondary">Vacia</ThemedText>
                    ) : (
                      <View style={{ gap: Spacing.one }}>
                        {ranked.map((s, i) => (
                          <View
                            key={s.athlete.id}
                            style={[styles.line, { borderColor: theme.hairline }]}
                          >
                            <Text
                              style={[
                                styles.pos,
                                { color: i === 0 ? theme.accent : theme.textSecondary },
                              ]}
                            >
                              {i + 1}
                            </Text>
                            {s.athlete.isTeamMember ? (
                              <View
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 999,
                                  backgroundColor: theme.team,
                                }}
                              />
                            ) : null}
                            <Text
                              style={[styles.name, { color: theme.text }]}
                              numberOfLines={1}
                            >
                              {s.athlete.name}
                            </Text>
                            <Text style={[styles.bw, { color: theme.textSecondary }]}>
                              {formatKg(s.athlete.bodyweightKg)}
                            </Text>
                            <Text style={[styles.total, { color: theme.text }]}>
                              {formatKg(s.total)}
                            </Text>
                          </View>
                        ))}
                        {c.athletes.length > 5 ? (
                          <ThemedText type="caption" themeColor="textSecondary">
                            + {c.athletes.length - 5} mas, toca la categoria para ver el detalle
                          </ThemedText>
                        ) : null}
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  },
  catHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  pos: {
    width: 22,
    ...TypeScale.caption,
    fontWeight: '800',
  },
  name: {
    flex: 1,
    ...TypeScale.caption,
    fontWeight: '700',
  },
  bw: {
    width: 56,
    textAlign: 'right',
    ...TypeScale.caption,
  },
  total: {
    width: 70,
    textAlign: 'right',
    ...TypeScale.body,
    fontWeight: '800',
  },
});
