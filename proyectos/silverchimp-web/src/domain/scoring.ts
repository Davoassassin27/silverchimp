import type { Athlete, Attempt, LiftKind } from './schema';

export function bestLift(attempts: Attempt[]): number {
  const valid = attempts.filter((a) => a.result === 'valid' && a.weightKg > 0);
  if (valid.length === 0) return 0;
  return Math.max(...valid.map((a) => a.weightKg));
}

export interface AthleteScore {
  athlete: Athlete;
  squatBest: number;
  benchBest: number;
  deadliftBest: number;
  subtotal: number;
  total: number;
  hasTotal: boolean;
  validSquat: number;
  validBench: number;
  validDeadlift: number;
}

export function scoreAthlete(athlete: Athlete): AthleteScore {
  const squatBest = bestLift(athlete.squat);
  const benchBest = bestLift(athlete.bench);
  const deadliftBest = bestLift(athlete.deadlift);
  const subtotal = squatBest + benchBest;
  const hasTotal = squatBest > 0 && benchBest > 0 && deadliftBest > 0;
  const total = hasTotal ? subtotal + deadliftBest : subtotal + deadliftBest;
  return {
    athlete,
    squatBest,
    benchBest,
    deadliftBest,
    subtotal,
    total,
    hasTotal,
    validSquat: athlete.squat.filter((a) => a.result === 'valid').length,
    validBench: athlete.bench.filter((a) => a.result === 'valid').length,
    validDeadlift: athlete.deadlift.filter((a) => a.result === 'valid').length,
  };
}

export function liftField(athlete: Athlete, lift: LiftKind): Attempt[] {
  return athlete[lift];
}

/**
 * Ranking by total DESC, tiebreak by bodyweight ASC (lighter wins).
 * Athletes with incomplete totals (missing valid S,B or D) sort after by
 * the partial they have, but among same total the lighter bodyweight wins.
 */
export function rankAthletes(athletes: Athlete[]): AthleteScore[] {
  const scored = athletes.map(scoreAthlete);
  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (a.athlete.bodyweightKg !== b.athlete.bodyweightKg) {
      return a.athlete.bodyweightKg - b.athlete.bodyweightKg;
    }
    return a.athlete.name.localeCompare(b.athlete.name);
  });
  return scored;
}

/**
 * Ranking focused on the deadlift phase: subtotal (S+B) fixed; "current total"
 * = subtotal + bestDeadliftSoFar. Updates live as deadlift attempts resolve.
 */
export function liveRanking(athletes: Athlete[]): AthleteScore[] {
  return rankAthletes(athletes);
}

export function formatKg(kg: number): string {
  if (kg === 0) return '-';
  return Number.isInteger(kg) ? `${kg}kg` : `${kg.toFixed(1)}kg`;
}

export const NEXT_ATTEMPT_STEP = 2.5;

export interface NextAttempt {
  lift: LiftKind;
  index: number;
  recommendedKg: number;
  hasPrevious: boolean;
  previousWeight: number;
  previousResult: 'pending' | 'valid' | 'null' | 'none';
}

/**
 * Returns the next attempt the athlete should perform, in competition order
 * (squat 1,2,3 -> bench 1,2,3 -> deadlift 1,2,3). The recommended weight is:
 *   - 0 if this is the very first attempt (no opener loaded yet)
 *   - previous + 2.5kg if the previous was valid
 *   - same as previous if the previous was null (retry) or still pending
 */
export function getNextAttempt(athlete: Athlete): NextAttempt | null {
  const order: LiftKind[] = ['squat', 'bench', 'deadlift'];
  const all: { lift: LiftKind; index: number; attempt: Attempt }[] = [];
  for (const lift of order) {
    for (let i = 0; i < 3; i++) {
      all.push({ lift, index: i, attempt: athlete[lift][i] });
    }
  }

  const emptyIdx = all.findIndex((a) => a.attempt.weightKg === 0);
  if (emptyIdx === -1) return null;

  const target = all[emptyIdx];

  if (emptyIdx === 0) {
    return {
      lift: target.lift,
      index: target.index,
      recommendedKg: 0,
      hasPrevious: false,
      previousWeight: 0,
      previousResult: 'none',
    };
  }

  const prev = all[emptyIdx - 1].attempt;
  const wasValid = prev.result === 'valid';
  const recommended = wasValid
    ? Math.round((prev.weightKg + NEXT_ATTEMPT_STEP) * 100) / 100
    : prev.weightKg;

  return {
    lift: target.lift,
    index: target.index,
    recommendedKg: recommended,
    hasPrevious: true,
    previousWeight: prev.weightKg,
    previousResult: prev.result,
  };
}

export function getDeltaFromLeader(ranked: AthleteScore[], athleteId: string): number {
  if (ranked.length === 0) return 0;
  const leader = ranked[0];
  if (leader.athlete.id === athleteId) return 0;
  const me = ranked.find((a) => a.athlete.id === athleteId);
  if (!me) return 0;
  return Math.max(0, leader.total - me.total);
}

export function getRankPosition(ranked: AthleteScore[], athleteId: string): number {
  return ranked.findIndex((a) => a.athlete.id === athleteId);
}

export interface RecommendedAttempt {
  weightKg: number;
  source: 'retry' | 'progression' | 'to-win' | 'none';
  detail: string;
}

/**
 * Default weight suggestion for the next attempt.
 *
 * Rules (in order):
 *   1. If there is a previous attempt with weight > 0:
 *        - result === 'null'  -> same weight (retry)
 *        - otherwise          -> previous + NEXT_ATTEMPT_STEP (progression)
 *   2. If this is the first attempt of the day and the athlete is behind the
 *      leader: target = leader.total + marginKg. The recommended weight is
 *      whatever this attempt needs to be, assuming it will end up as the
 *      athlete's best for this lift, so the other lifts are taken at their
 *      current bests.
 *   3. If the athlete is already the leader (or no one has a total): 0
 *      (the coach decides an opener).
 */
export function getRecommendedForNextAttempt(
  athlete: Athlete,
  lift: LiftKind,
  index: number,
  ranked: AthleteScore[],
  marginKg: number = 0.5
): RecommendedAttempt {
  const order: LiftKind[] = ['squat', 'bench', 'deadlift'];
  const flat: { lift: LiftKind; index: number; attempt: Attempt }[] = [];
  for (const l of order) {
    for (let i = 0; i < 3; i++) {
      flat.push({ lift: l, index: i, attempt: athlete[l][i] });
    }
  }
  const currentIdx = flat.findIndex((a) => a.lift === lift && a.index === index);
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;

  if (prev && prev.attempt.weightKg > 0) {
    if (prev.attempt.result === 'null') {
      return {
        weightKg: prev.attempt.weightKg,
        source: 'retry',
        detail: 'retry: el tiro anterior fue nulo, repeti el mismo peso',
      };
    }
    const next = Math.round((prev.attempt.weightKg + NEXT_ATTEMPT_STEP) * 100) / 100;
    return {
      weightKg: next,
      source: 'progression',
      detail: 'progresion: ' + prev.attempt.weightKg + 'kg + ' + NEXT_ATTEMPT_STEP + 'kg',
    };
  }

  const leader = ranked[0];
  if (!leader || leader.total <= 0) {
    return {
      weightKg: 0,
      source: 'none',
      detail: 'sin lider de referencia, pone un opener manual',
    };
  }
  if (leader.athlete.id === athlete.id) {
    return {
      weightKg: 0,
      source: 'none',
      detail: 'sos el lider, decide tu opener',
    };
  }

  const otherBests =
    (lift !== 'squat' ? bestLift(athlete.squat) : 0) +
    (lift !== 'bench' ? bestLift(athlete.bench) : 0) +
    (lift !== 'deadlift' ? bestLift(athlete.deadlift) : 0);

  const target = leader.total + marginKg;
  const needed = Math.max(0, target - otherBests);
  const rounded = Math.round(needed * 100) / 100;
  return {
    weightKg: rounded,
    source: 'to-win',
    detail: 'para ganar: ' + formatKg(target) + ' - ' + formatKg(otherBests) + ' (otros lifts) = ' + formatKg(rounded),
  };
}
