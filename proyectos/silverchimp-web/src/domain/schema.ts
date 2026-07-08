import { z } from 'zod';

export const LiftKindSchema = z.enum(['squat', 'bench', 'deadlift']);
export type LiftKind = z.infer<typeof LiftKindSchema>;

export const AttemptResultSchema = z.enum(['pending', 'valid', 'null']);
export type AttemptResult = z.infer<typeof AttemptResultSchema>;

export const AttemptSchema = z.object({
  weightKg: z.number().nonnegative().default(0),
  result: AttemptResultSchema.default('pending'),
});
export type Attempt = z.infer<typeof AttemptSchema>;

export const THREE = [0, 1, 2] as const;

export const GenderSchema = z.enum(['M', 'F']);
export type Gender = z.infer<typeof GenderSchema>;

export const AthleteSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  bodyweightKg: z.number().nonnegative().default(0),
  unit: z.enum(['kg', 'lb']).default('kg'),
  gender: GenderSchema.default('M'),
  isTeamMember: z.boolean().default(false),
  squat: z.array(AttemptSchema).length(3).default([defaultAttempt(), defaultAttempt(), defaultAttempt()]),
  bench: z.array(AttemptSchema).length(3).default([defaultAttempt(), defaultAttempt(), defaultAttempt()]),
  deadlift: z.array(AttemptSchema).length(3).default([defaultAttempt(), defaultAttempt(), defaultAttempt()]),
});
export type Athlete = z.infer<typeof AthleteSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1),
  athletes: z.array(AthleteSchema).default([]),
});
export type Category = z.infer<typeof CategorySchema>;

export const EventSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  federation: z.string().optional(),
  location: z.string().optional(),
  categories: z.array(CategorySchema).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Event = z.infer<typeof EventSchema>;

export const LIFT_LABEL: Record<LiftKind, string> = {
  squat: 'Squat',
  bench: 'Bench',
  deadlift: 'Deadlift',
};

export const LIFT_ABBR: Record<LiftKind, string> = {
  squat: 'S',
  bench: 'B',
  deadlift: 'D',
};

export const RESULT_LABEL: Record<AttemptResult, string> = {
  pending: '—',
  valid: 'Válido',
  null: 'Nulo',
};

function defaultAttempt(): Attempt {
  return { weightKg: 0, result: 'pending' };
}

export function emptyThree(): Attempt[] {
  return [defaultAttempt(), defaultAttempt(), defaultAttempt()];
}