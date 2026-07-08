import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { GradientView } from '@/components/gradient-view';
import { Spacing, TypeScale, getGradient } from '@/constants/theme';
import type { Athlete } from '@/domain/schema';
import { rankAthletes, formatKg } from '@/domain/scoring';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface LiveRankingProps {
  athletes: Athlete[];
  highlightAthleteId?: string;
  compact?: boolean;
}

export function LiveRanking({ athletes, highlightAthleteId, compact }: LiveRankingProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const ranked = rankAthletes(athletes);
  const accentColors = getGradient('accent', scheme) as unknown as readonly [string, string];

  if (ranked.length === 0) {
    return (
      <Card variant="elevated" style={{ gap: Spacing.one }}>
        <Text style={{ color: theme.textSecondary, ...TypeScale.body }}>
          Sin atletas cargados. Agrega atletas para ver el ranking en vivo.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="flat" style={{ padding: 0, overflow: 'hidden' }}>
      <GradientView
        colors={accentColors}
        direction="diagonal-down"
        style={styles.headRow}
      >
        <Text style={[styles.cellPos, { color: '#FFFFFFCC' }]}>#</Text>
        <Text style={[styles.cellName, { color: '#FFFFFFCC' }]}>ATLETA</Text>
        <Text style={[styles.cellNum, { color: '#FFFFFFCC' }]}>PC</Text>
        <Text style={[styles.cellNum, { color: '#FFFFFF' }]}>SQ</Text>
        <Text style={[styles.cellNum, { color: '#FFFFFF' }]}>BP</Text>
        <Text style={[styles.cellNum, { color: '#FFFFFF' }]}>DL</Text>
        <Text style={[styles.cellTotal, { color: '#FFFFFF' }]}>TOTAL</Text>
      </GradientView>
      <ScrollView style={compact ? { maxHeight: 320 } : undefined} showsVerticalScrollIndicator={false}>
        {ranked.map((s, i) => {
          const highlight = s.athlete.id === highlightAthleteId;
          const rowBg = highlight
            ? theme.accentSoft
            : i % 2 === 0
              ? 'transparent'
              : theme.background;
          return (
            <View
              key={s.athlete.id}
              style={[
                styles.row,
                {
                  backgroundColor: rowBg,
                  borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderColor: theme.hairline,
                },
              ]}
            >
              <Text
                style={[
                  styles.cellPos,
                  { color: highlight ? theme.accent : theme.textSecondary, fontWeight: '800' },
                ]}
              >
                {i + 1}
              </Text>
              <View style={[styles.cellName, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
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
                  style={{
                    color: highlight ? theme.accent : theme.text,
                    fontWeight: '700',
                    ...TypeScale.caption,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {s.athlete.name}
                </Text>
              </View>
              <Text style={[styles.cellNum, { color: theme.textSecondary }]}>
                {formatKg(s.athlete.bodyweightKg)}
              </Text>
              <Text style={[styles.cellNum, { color: theme.squat, fontWeight: '700' }]}>
                {formatKg(s.squatBest)}
              </Text>
              <Text style={[styles.cellNum, { color: theme.bench, fontWeight: '700' }]}>
                {formatKg(s.benchBest)}
              </Text>
              <Text style={[styles.cellNum, { color: theme.deadlift, fontWeight: '700' }]}>
                {formatKg(s.deadliftBest)}
              </Text>
              <Text
                style={[
                  styles.cellTotal,
                  { color: highlight ? theme.accent : theme.text, fontWeight: '800' },
                ]}
              >
                {formatKg(s.total)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {ranked.some((a, i) => i > 0 && a.total === ranked[i - 1].total) ? (
        <Text style={[styles.note, { color: theme.textSecondary, borderColor: theme.hairline }]}>
          Empate en total: gana el de menor peso corporal.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  cellPos: {
    width: 28,
    ...TypeScale.caption,
    fontWeight: '800',
  },
  cellName: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  cellNum: {
    width: 44,
    textAlign: 'right',
    ...TypeScale.caption,
  },
  cellTotal: {
    width: 60,
    textAlign: 'right',
    ...TypeScale.body,
  },
  note: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 11,
    fontStyle: 'italic',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
