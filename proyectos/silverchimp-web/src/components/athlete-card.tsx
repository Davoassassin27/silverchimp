import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { GradientView } from '@/components/gradient-view';
import { ResultToggle } from '@/components/result-toggle';
import { WeightInput } from '@/components/weight-input';
import { Radius, Spacing, TypeScale, getGradient } from '@/constants/theme';
import type { Attempt, Athlete, AttemptResult, LiftKind } from '@/domain/schema';
import { bestLift, formatKg } from '@/domain/scoring';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface AthleteCardProps {
  athlete: Athlete;
  onChangeWeight: (lift: LiftKind, index: number, weightKg: number) => void;
  onChangeResult: (lift: LiftKind, index: number, result: AttemptResult) => void;
  onPress?: () => void;
  onLongPress?: () => void;
}

const ATTEMPT_LABELS = ['1', '2', '3'] as const;
const LIFT_ORDER: LiftKind[] = ['squat', 'bench', 'deadlift'];
const LIFT_TITLE: Record<LiftKind, string> = {
  squat: 'Squat',
  bench: 'Bench Press',
  deadlift: 'Deadlift',
};

export function AthleteCard({ athlete, onChangeWeight, onChangeResult, onPress, onLongPress }: AthleteCardProps) {
  const theme = useTheme();
  const squatBest = bestLift(athlete.squat);
  const benchBest = bestLift(athlete.bench);
  const deadliftBest = bestLift(athlete.deadlift);
  const subtotal = squatBest + benchBest;
  const total = subtotal + deadliftBest;

  function setWeight(lift: LiftKind, index: number, w: number) {
    onChangeWeight(lift, index, w);
    if (w === 0) onChangeResult(lift, index, 'pending');
  }

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={350}>
      <Card variant="elevated" style={{ gap: Spacing.three }}>
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
              {athlete.isTeamMember ? (
                <View
                  style={[styles.teamDot, { backgroundColor: theme.team }]}
                />
              ) : null}
              <Text style={{ color: theme.text, ...TypeScale.h2 }}>{athlete.name}</Text>
            </View>
            <Text style={{ color: theme.textSecondary, ...TypeScale.caption, marginTop: 2 }}>
              {formatKg(athlete.bodyweightKg)} {athlete.unit} corporal
              {' - '}
              {athlete.gender === 'M' ? 'M' : 'F'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>TOTAL</Text>
            <Text style={{ color: theme.text, ...TypeScale.h1 }}>{formatKg(total)}</Text>
          </View>
        </View>

        {LIFT_ORDER.map((lift) => (
          <LiftSection
            key={lift}
            lift={lift}
            attempts={athlete[lift]}
            onChangeWeight={(idx, w) => setWeight(lift, idx, w)}
            onChangeResult={(idx, r) => onChangeResult(lift, idx, r)}
            runningSubtotal={
              lift === 'squat'
                ? bestLiftUpTo(athlete.squat)
                : lift === 'bench'
                  ? squatBest + bestLiftUpTo(athlete.bench)
                  : subtotal + bestLiftUpTo(athlete.deadlift)
            }
            fullSubtotal={lift === 'deadlift' ? subtotal : undefined}
          />
        ))}
      </Card>
    </Pressable>
  );
}

function LiftSection({
  lift,
  attempts,
  onChangeWeight,
  onChangeResult,
  runningSubtotal,
  fullSubtotal,
}: {
  lift: LiftKind;
  attempts: Attempt[];
  onChangeWeight: (index: number, w: number) => void;
  onChangeResult: (index: number, r: AttemptResult) => void;
  runningSubtotal: number;
  fullSubtotal?: number;
}) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = getGradient(lift, scheme) as unknown as readonly [string, string];

  return (
    <View style={{ gap: Spacing.two }}>
      <GradientView
        colors={colors}
        direction="horizontal"
        borderRadius={Radius.md}
        style={styles.liftHeader}
      >
        <Text
          style={{
            color: '#FFFFFF',
            ...TypeScale.bodyStrong,
            fontWeight: '800',
            flex: 1,
          }}
        >
          {LIFT_TITLE[lift]}
        </Text>
        {lift === 'bench' ? (
          <View style={[styles.subtotalPill, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
            <Text style={{ color: '#FFFFFFCC', ...TypeScale.micro, fontWeight: '700' }}>
              SUBTOTAL
            </Text>
            <Text style={{ color: '#FFFFFF', ...TypeScale.bodyStrong, fontWeight: '800' }}>
              {formatKg(runningSubtotal)}
            </Text>
          </View>
        ) : null}
        {lift === 'deadlift' ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#FFFFFFCC', ...TypeScale.micro, fontWeight: '700' }}>
              S+B: {formatKg(fullSubtotal ?? 0)}
            </Text>
            <Text style={{ color: '#FFFFFF', ...TypeScale.bodyStrong, fontWeight: '800' }}>
              LIVE: {formatKg(runningSubtotal)}
            </Text>
          </View>
        ) : null}
      </GradientView>

      {attempts.map((a, idx) => (
        <View key={idx} style={styles.attemptRow}>
          <View
            style={[
              styles.attemptLabel,
              { backgroundColor: theme.background, borderColor: theme.hairline },
            ]}
          >
            <Text style={{ color: theme.text, ...TypeScale.caption, fontWeight: '800' }}>
              {ATTEMPT_LABELS[idx]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <WeightInput value={a.weightKg} onChange={(w) => onChangeWeight(idx, w)} />
          </View>
          <View style={{ width: 120 }}>
            <ResultToggle value={a.result} onChange={(r) => onChangeResult(idx, r)} />
          </View>
        </View>
      ))}
    </View>
  );
}

function bestLiftUpTo(attempts: Attempt[]): number {
  let best = 0;
  for (const a of attempts) {
    if (a.result === 'valid' && a.weightKg > best) best = a.weightKg;
  }
  return best;
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  liftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  subtotalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half + 2,
    borderRadius: 999,
    gap: Spacing.one,
  },
  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  attemptLabel: {
    width: 36,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
