import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Athlete,
  AthleteSchema,
  Attempt,
  AttemptResult,
  Category,
  emptyThree,
  Event,
  EventSchema,
  LiftKind,
} from './schema';

export interface EventInput {
  name: string;
  startDate: string;
  endDate: string;
  federation?: string;
  location?: string;
}

export interface CategoryInput {
  name: string;
}

export interface AthleteInput {
  name: string;
  bodyweightKg: number;
  unit?: 'kg' | 'lb';
  gender?: 'M' | 'F';
  isTeamMember?: boolean;
}

export interface EventStoreState {
  events: Event[];
  ready: boolean;
  setReady: (r: boolean) => void;
  rehydrateFromStorage: () => Promise<void>;

  addEvent: (input: EventInput) => string;
  updateEvent: (id: string, patch: Partial<EventInput>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;

  addCategory: (eventId: string, input: CategoryInput) => string;
  deleteCategory: (eventId: string, categoryId: string) => void;

  addAthlete: (eventId: string, categoryId: string, input: AthleteInput) => string;
  updateAthlete: (eventId: string, categoryId: string, athleteId: string, patch: Partial<AthleteInput>) => void;
  deleteAthlete: (eventId: string, categoryId: string, athleteId: string) => void;

  setAttemptWeight: (eventId: string, categoryId: string, athleteId: string, lift: LiftKind, index: number, weightKg: number) => void;
  setAttemptResult: (eventId: string, categoryId: string, athleteId: string, lift: LiftKind, index: number, result: AttemptResult) => void;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const STORAGE_KEY = 'silverchimp.events.v2';

export const useEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      events: [],
      ready: false,
      setReady: (r) => set({ ready: r }),
      rehydrateFromStorage: async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (!raw) {
            set({ ready: true });
            return;
          }
          const parsed = JSON.parse(raw);
          const list: Event[] = Array.isArray(parsed?.state?.events)
            ? parsed.state.events.map((e: unknown) => (e ? EventSchema.parse(e) : null)).filter(Boolean)
            : [];
          set({ events: list, ready: true });
        } catch {
          set({ ready: true });
        }
      },

      addEvent: (input) => {
        const id = uid();
        const now = Date.now();
        const event: Event = EventSchema.parse({
          id,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          federation: input.federation,
          location: input.location,
          categories: [],
          createdAt: now,
          updatedAt: now,
        });
        set((s) => ({ events: [event, ...s.events] }));
        return id;
      },
      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)),
        })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      getEvent: (id) => get().events.find((e) => e.id === id),

      addCategory: (eventId, input) => {
        const id = uid();
        const category: Category = { id, eventId, name: input.name, athletes: [] };
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, categories: [...e.categories, category], updatedAt: Date.now() }
              : e
          ),
        }));
        return id;
      },
      deleteCategory: (eventId, categoryId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, categories: e.categories.filter((c) => c.id !== categoryId), updatedAt: Date.now() }
              : e
          ),
        })),

      addAthlete: (eventId, categoryId, input) => {
        const id = uid();
        const athlete: Athlete = AthleteSchema.parse({
          id,
          name: input.name,
          bodyweightKg: input.bodyweightKg,
          unit: input.unit ?? 'kg',
          gender: input.gender ?? 'M',
          isTeamMember: input.isTeamMember ?? false,
          squat: emptyThree(),
          bench: emptyThree(),
          deadlift: emptyThree(),
        });
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  categories: e.categories.map((c) =>
                    c.id === categoryId ? { ...c, athletes: [...c.athletes, athlete] } : c
                  ),
                  updatedAt: Date.now(),
                }
              : e
          ),
        }));
        return id;
      },
      updateAthlete: (eventId, categoryId, athleteId, patch) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  categories: e.categories.map((c) =>
                    c.id === categoryId
                      ? {
                          ...c,
                          athletes: c.athletes.map((a) => (a.id === athleteId ? { ...a, ...patch } : a)),
                        }
                      : c
                  ),
                  updatedAt: Date.now(),
                }
              : e
          ),
        })),
      deleteAthlete: (eventId, categoryId, athleteId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  categories: e.categories.map((c) =>
                    c.id === categoryId
                      ? { ...c, athletes: c.athletes.filter((a) => a.id !== athleteId) }
                      : c
                  ),
                  updatedAt: Date.now(),
                }
              : e
          ),
        })),

      setAttemptWeight: (eventId, categoryId, athleteId, lift, index, weightKg) => {
        set((s) => updateAttempts(s, eventId, categoryId, athleteId, lift, (arr) => {
          const next = [...arr];
          next[index] = { ...next[index], weightKg };
          return next;
        }));
      },
      setAttemptResult: (eventId, categoryId, athleteId, lift, index, result) => {
        set((s) => updateAttempts(s, eventId, categoryId, athleteId, lift, (arr) => {
          const next = [...arr];
          next[index] = { ...next[index], result };
          return next;
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setReady(true);
      },
    }
  )
);

function updateAttempts(
  state: EventStoreState,
  eventId: string,
  categoryId: string,
  athleteId: string,
  lift: LiftKind,
  mutate: (arr: Attempt[]) => Attempt[]
): EventStoreState {
  return {
    ...state,
    events: state.events.map((e) =>
      e.id === eventId
        ? {
            ...e,
            categories: e.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    athletes: c.athletes.map((a) => {
                      if (a.id !== athleteId) return a;
                      const current = a[lift];
                      const updated = mutate(current as Attempt[]);
                      return { ...a, [lift]: updated };
                    }),
                  }
                : c
            ),
            updatedAt: Date.now(),
          }
        : e
    ),
  };
}