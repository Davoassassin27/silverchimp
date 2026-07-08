import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AttemptEditor } from '@/components/attempt-editor';
import { Card } from '@/components/card';
import { GradientView } from '@/components/gradient-view';
import { Radius, Spacing, ThemeColor, TypeScale, getGradient } from '@/constants/theme';
import { formatGL, ipfGLPoints } from '@/domain/ipf-gl';
import type { Athlete, Attempt, AttemptResult, LiftKind } from '@/domain/schema';
import {
  formatKg,
  getDeltaFromLeader,
  getNextAttempt,
  getRankPosition,
  getRecommendedForNextAttempt,
  rankAthletes,
  type RecommendedAttempt,
} from '@/domain/scoring';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const LIFT_ORDER: LiftKind[] = ['squat', 'bench', 'deadlift'];
const LIFT_SHORT: Record<LiftKind, string> = {
  squat: 'SQ',
  bench: 'BP',
  deadlift: 'DL',
};
const RESULT_SHORT: Record<AttemptResult, string> = {
  pending: '-',
  valid: 'V',
  null: 'N',
};
const RESULT_BG: Record<AttemptResult, ThemeColor | null> = {
  pending: null,
  valid: 'success',
  null: 'fail',
};

const LIFT_LABEL_HEADER: Record<LiftKind, string> = {
  squat: 'SQ',
  bench: 'BP',
  deadlift: 'DL',
};

interface EditingCell {
  athleteId: string;
  lift: LiftKind;
  index: number;
}

interface LiveGridProps {
  athletes: Athlete[];
  onChangeWeight: (athleteId: string, lift: LiftKind, index: number, weightKg: number) => void;
  onChangeResult: (athleteId: string, lift: LiftKind, index: number, result: AttemptResult) => void;
  highlightAthleteId?: string;
}

export function LiveGrid({
  athletes,
  onChangeWeight,
  onChangeResult,
  highlightAthleteId,
}: LiveGridProps) {
  const theme = useTheme();
  const ranked = useMemo(() => rankAthletes(athletes), [athletes]);
  const [editing, setEditing] = useState<EditingCell | null>(null);

  const editingAthlete = editing ? athletes.find((a) => a.id === editing.athleteId) : undefined;
  const editingAttempt: Attempt | undefined = editingAthlete && editing
    ? editingAthlete[editing.lift][editing.index]
    : undefined;

  const recommendation: RecommendedAttempt | null = editingAthlete && editing
    ? getRecommendedForNextAttempt(editingAthlete, editing.lift, editing.index, ranked, 0.5)
    : null;

  function openCell(athleteId: string, lift: LiftKind, index: number) {
    setEditing({ athleteId, lift, index });
  }

  function saveCell(weightKg: number, result: AttemptResult) {
    if (!editing) return;
    onChangeWeight(editing.athleteId, editing.lift, editing.index, weightKg);
    onChangeResult(editing.athleteId, editing.lift, editing.index, result);
    setEditing(null);
  }

  function clearCell() {
    if (!editing) return;
    onChangeWeight(editing.athleteId, editing.lift, editing.index, 0);
    onChangeResult(editing.athleteId, editing.lift, editing.index, 'pending');
    setEditing(null);
  }

  if (athletes.length === 0) {
    return (
      <Card>
        <Text style={{ color: theme.textSecondary, ...TypeScale.body }}>
          Sin atletas cargados.
        </Text>
      </Card>
    );
  }

  const ordered = ranked.map((s) => s.athlete);

  return (
    <View style={{ gap: Spacing.two }}>
      <Legend />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ paddingRight: Spacing.four }}
      >
        <View>
          <HeaderRow />
          {ordered.map((athlete) => {
            const score = ranked.find((s) => s.athlete.id === athlete.id);
            if (!score) return null;
            const rank = getRankPosition(ranked, athlete.id);
            const delta = getDeltaFromLeader(ranked, athlete.id);
            const next = getNextAttempt(athlete);
            return (
              <AthleteRow
                key={athlete.id}
                athlete={athlete}
                rank={rank}
                total={score.total}
                delta={delta}
                next={next}
                highlight={athlete.id === highlightAthleteId}
                onCellPress={(lift, index) => openCell(athlete.id, lift, index)}
              />
            );
          })}
        </View>
      </ScrollView>

      {editing && editingAthlete && editingAttempt && recommendation ? (
        <AttemptEditor
          visible
          athleteName={editingAthlete.name}
          lift={editing.lift}
          index={editing.index}
          attempt={editingAttempt}
          recommendation={recommendation}
          onClose={() => setEditing(null)}
          onSave={saveCell}
          onClear={clearCell}
        />
      ) : null}
    </View>
  );
}

function HeaderRow() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const heroColors = getGradient('hero', scheme) as unknown as readonly [string, string];
  return (
    <GradientView colors={heroColors} direction="diagonal-down" style={styles.headRow}>
      <Text style={[styles.hPos, { color: '#FFFFFFCC' }]}>#</Text>
      <Text style={[styles.hName, { color: '#FFFFFFCC' }]}>ATLETA</Text>
      {LIFT_ORDER.map((lift) => (
        <View key={lift} style={styles.liftGroup}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.headCell, { borderColor: 'rgba(255,255,255,0.18)' }]}>
              <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
                {LIFT_LABEL_HEADER[lift]}{i + 1}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <Text style={[styles.hTotal, { color: '#FFFFFF' }]}>TOTAL</Text>
      <Text style={[styles.hGL, { color: '#FFFFFF' }]}>GL</Text>
      <Text style={[styles.hDelta, { color: '#FFFFFFCC' }]}>DELTA</Text>
      <Text style={[styles.hNext, { color: '#FFFFFFCC' }]}>NEXT</Text>
    </GradientView>
  );
}

function AthleteRow({
  athlete,
  rank,
  total,
  delta,
  next,
  highlight,
  onCellPress,
}: {
  athlete: Athlete;
  rank: number;
  total: number;
  delta: number;
  next: ReturnType<typeof getNextAttempt>;
  highlight: boolean;
  onCellPress: (lift: LiftKind, index: number) => void;
}) {
  const theme = useTheme();
  const isLeader = rank === 0;
  const rowBg = highlight
    ? theme.accent
    : athlete.isTeamMember
      ? theme.accentSoft
      : theme.backgroundElement;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: rowBg,
          borderColor: athlete.isTeamMember ? theme.accent : theme.hairline,
          borderWidth: athlete.isTeamMember ? 1 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View
        style={[
          styles.posBadge,
          { backgroundColor: isLeader ? theme.accent : 'transparent' },
        ]}
      >
        <Text
          style={{
            color: isLeader ? '#FFFFFF' : theme.textSecondary,
            fontWeight: '800',
            ...TypeScale.caption,
          }}
        >
          {rank + 1}
        </Text>
      </View>
      <View style={styles.nameCell}>
        {athlete.isTeamMember ? (
          <View style={[styles.teamDot, { backgroundColor: isLeader ? '#FFFFFF' : theme.accent }]} />
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            color: isLeader || highlight ? '#FFFFFF' : theme.text,
            fontWeight: '700',
            ...TypeScale.caption,
          }}
        >
          {athlete.name}
        </Text>
        <Text
          style={{
            color: isLeader || highlight ? '#FFFFFFCC' : theme.textSecondary,
            fontSize: 10,
          }}
        >
          {formatKg(athlete.bodyweightKg)} {athlete.unit}
        </Text>
      </View>
      {LIFT_ORDER.map((lift) => (
        <View key={lift} style={styles.liftGroup}>
          {[0, 1, 2].map((i) => {
            const a = athlete[lift][i];
            const resKey = RESULT_BG[a.result];
            const resColor = resKey ? theme[resKey] : null;
            return (
              <Pressable
                key={i}
                onPress={() => onCellPress(lift, i)}
                style={[
                  styles.cell,
                  {
                    backgroundColor: resColor ?? 'transparent',
                    borderColor: theme.hairline,
                  },
                ]}
              >
                  <Text
                    style={{
                      color: a.result === 'pending' ? theme.textSecondary : '#FFFFFF',
                      fontWeight: '800',
                      fontSize: 11,
                    }}
                  >
                    {a.weightKg > 0 ? formatKg(a.weightKg) : '-'}
                  </Text>
                  {a.weightKg > 0 ? (
                    <Text
                      style={{
                        color: a.result === 'pending' ? theme.textSecondary : '#FFFFFFCC',
                        fontSize: 9,
                        fontWeight: '800',
                      }}
                    >
                      {RESULT_SHORT[a.result]}
                    </Text>
                  ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
        <View style={styles.totalCell}>
          <Text
            style={{
              color: isLeader || highlight ? '#FFFFFF' : theme.text,
              fontWeight: '800',
              ...TypeScale.body,
            }}
          >
            {formatKg(total)}
          </Text>
        </View>
        <View style={styles.glCell}>
          <Text
            style={{
              color: isLeader || highlight ? '#FFFFFF' : theme.text,
              fontWeight: '800',
              ...TypeScale.caption,
            }}
          >
            {formatGL(ipfGLPoints(total, athlete.bodyweightKg, athlete.gender))}
          </Text>
        </View>
        <View style={styles.deltaCell}>
          <Text
            style={{
              color: isLeader
                ? '#FFFFFF'
                : delta > 0
                  ? theme.fail
                  : theme.success,
              fontWeight: '800',
              ...TypeScale.caption,
            }}
          >
            {isLeader ? '0' : delta > 0 ? '-' + formatKg(delta) : '0'}
          </Text>
        </View>
        <View style={styles.nextCell}>
          {next ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: isLeader || highlight ? '#FFFFFFCC' : theme.textSecondary,
                  fontSize: 10,
                  fontWeight: '700',
                }}
              >
                {LIFT_SHORT[next.lift]}{next.index + 1}
              </Text>
              <Text
                style={{
                  color: isLeader || highlight ? '#FFFFFF' : theme.text,
                  fontWeight: '800',
                  ...TypeScale.caption,
                }}
              >
                {next.recommendedKg > 0 ? formatKg(next.recommendedKg) : '-'}
              </Text>
            </View>
          ) : (
            <Text style={{ color: theme.textSecondary, fontSize: 10 }}>OK</Text>
          )}
        </View>
    </View>
  );
}

function Legend() {
  const theme = useTheme();
  return (
    <View style={styles.legendRow}>
      <LegendDot color={theme.success} label="V" />
      <LegendDot color={theme.fail} label="N" />
      <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '600' }}>= valido / nulo</Text>
      <View style={[styles.legendDot, { backgroundColor: theme.accent, marginLeft: Spacing.two }]} />
      <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '600' }}>= equipo</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={[styles.legendItem]}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]}>
        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  headCell: {
    width: 50,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  posBadge: {
    width: 28,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameCell: {
    width: 130,
    minHeight: 56,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    justifyContent: 'center',
    gap: 2,
  },
  teamDot: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  liftGroup: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 2,
  },
  totalCell: {
    width: 70,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  glCell: {
    width: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  deltaCell: {
    width: 60,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  nextCell: {
    width: 60,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  hPos: {
    width: 28,
    ...TypeScale.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  hName: {
    width: 130,
    ...TypeScale.caption,
    fontWeight: '800',
    paddingHorizontal: Spacing.two,
  },
  hTotal: {
    width: 70,
    ...TypeScale.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  hGL: {
    width: 56,
    ...TypeScale.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  hDelta: {
    width: 60,
    ...TypeScale.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  hNext: {
    width: 60,
    ...TypeScale.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 18,
    height: 18,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
