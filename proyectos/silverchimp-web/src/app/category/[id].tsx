import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AthleteCard } from '@/components/athlete-card';
import { Card } from '@/components/card';
import { Segmented } from '@/components/field';
import { LiveGrid } from '@/components/live-grid';
import { LiveRanking } from '@/components/live-ranking';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import type { AttemptResult, LiftKind } from '@/domain/schema';

type ViewMode = 'detail' | 'live';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = useEventStore((s) =>
    s.events.flatMap((e) => e.categories).find((c) => c.id === id)
  );
  const event = useEventStore((s) => s.events.find((e) => e.id === category?.eventId));
  const setAttemptWeight = useEventStore((s) => s.setAttemptWeight);
  const setAttemptResult = useEventStore((s) => s.setAttemptResult);
  const deleteAthlete = useEventStore((s) => s.deleteAthlete);

  const [viewMode, setViewMode] = useState<ViewMode>('detail');

  if (!category || !event) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: Spacing.four, gap: Spacing.three }}>
          <ThemedText type="h2">Categoria no encontrada</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const safeCategory = category;

  function onWeight(athleteId: string, lift: LiftKind, index: number, weightKg: number) {
    if (!safeCategory) return;
    setAttemptWeight(safeCategory.eventId, safeCategory.id, athleteId, lift, index, weightKg);
  }
  function onResult(athleteId: string, lift: LiftKind, index: number, result: AttemptResult) {
    if (!safeCategory) return;
    setAttemptResult(safeCategory.eventId, safeCategory.id, athleteId, lift, index, result);
  }
  function confirmDelete(athleteId: string, name: string) {
    if (!safeCategory) return;
    Alert.alert('Eliminar atleta', 'Eliminar a ' + name + '?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteAthlete(safeCategory.eventId, safeCategory.id, athleteId),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={{ gap: Spacing.one }}>
          <ThemedText type="micro" themeColor="textSecondary">
            CATEGORIA - {event.name.toUpperCase()}
          </ThemedText>
          <ThemedText type="display">{category.name}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {category.athletes.length} atletas - long-press sobre un atleta para eliminarlo
          </ThemedText>
        </Card>

        <Segmented
          label="Vista"
          value={viewMode}
          onValueChange={setViewMode}
          options={[
            { value: 'detail', label: 'Detalle' },
            { value: 'live', label: 'Tiempo real' },
          ]}
        />

        {viewMode === 'live' ? (
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="caption" themeColor="textSecondary">
              TIEMPO REAL - toca cualquier celda para editar en vivo
            </ThemedText>
            <LiveGrid
              athletes={category.athletes}
              onChangeWeight={onWeight}
              onChangeResult={onResult}
            />
          </View>
        ) : (
          <>
            <View style={{ gap: Spacing.two }}>
              <ThemedText
                type="caption"
                themeColor="textSecondary"
                style={{ marginTop: Spacing.one }}
              >
                RANKING EN VIVO
              </ThemedText>
              <LiveRanking athletes={category.athletes} />
            </View>

            {category.athletes.length === 0 ? (
              <Card variant="elevated">
                <ThemedText type="body" themeColor="textSecondary">
                  Volve al evento y agrega atletas a esta categoria.
                </ThemedText>
              </Card>
            ) : (
              <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
                <ThemedText type="caption" themeColor="textSecondary">
                  INTENTOS - toca los botones +/- o escribi el peso - V = valido, N = nulo
                </ThemedText>
                {category.athletes.map((a) => (
                  <AthleteCard
                    key={a.id}
                    athlete={a}
                    onChangeWeight={(lift, idx, w) => onWeight(a.id, lift, idx, w)}
                    onChangeResult={(lift, idx, r) => onResult(a.id, lift, idx, r)}
                    onLongPress={() => confirmDelete(a.id, a.name)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});
