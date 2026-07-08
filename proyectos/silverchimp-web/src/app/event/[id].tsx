import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Field, Segmented } from '@/components/field';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import { useTheme } from '@/hooks/use-theme';

export default function EventDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEventStore((s) => s.events.find((e) => e.id === id));
  const addCategory = useEventStore((s) => s.addCategory);
  const deleteCategory = useEventStore((s) => s.deleteCategory);
  const addAthlete = useEventStore((s) => s.addAthlete);
  const deleteAthlete = useEventStore((s) => s.deleteAthlete);

  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const [athleteModalFor, setAthleteModalFor] = useState<string | null>(null);
  const [athleteName, setAthleteName] = useState('');
  const [athleteBw, setAthleteBw] = useState('');
  const [athleteUnit, setAthleteUnit] = useState<'kg' | 'lb'>('kg');
  const [athleteGender, setAthleteGender] = useState<'M' | 'F'>('M');
  const [athleteIsTeam, setAthleteIsTeam] = useState<'si' | 'no'>('no');
  const [athleteError, setAthleteError] = useState('');

  const totalAthletes = useMemo(
    () => (event ? event.categories.reduce((acc, c) => acc + c.athletes.length, 0) : 0),
    [event]
  );

  if (!event) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: Spacing.four, gap: Spacing.three }}>
          <ThemedText type="h2">Evento no encontrado</ThemedText>
          <Button label="Volver" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  function submitCategory() {
    if (!event) return;
    if (!categoryName.trim()) return setCategoryError('Nombre obligatorio');
    addCategory(event.id, { name: categoryName.trim() });
    setCategoryName('');
    setCategoryError('');
    setCategoryModal(false);
  }

  function openAthleteModal(categoryId: string) {
    setAthleteModalFor(categoryId);
    setAthleteName('');
    setAthleteBw('');
    setAthleteUnit('kg');
    setAthleteGender('M');
    setAthleteIsTeam('no');
    setAthleteError('');
  }

  function submitAthlete() {
    if (!event || !athleteModalFor) return;
    if (!athleteName.trim()) return setAthleteError('Nombre obligatorio');
    const bw = Number(athleteBw.replace(',', '.').trim());
    if (!Number.isFinite(bw) || bw <= 0) return setAthleteError('Peso corporal obligatorio (>0)');
    addAthlete(event.id, athleteModalFor, {
      name: athleteName.trim(),
      bodyweightKg: bw,
      unit: athleteUnit,
      gender: athleteGender,
      isTeamMember: athleteIsTeam === 'si',
    });
    setAthleteModalFor(null);
  }

  function confirmDeleteCategory(categoryId: string, name: string) {
    if (!event) return;
    Alert.alert(
      'Eliminar categoria',
      'Eliminar "' + name + '" y todos sus atletas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteCategory(event.id, categoryId) },
      ]
    );
  }

  function confirmDeleteAthlete(categoryId: string, athleteId: string, name: string) {
    if (!event) return;
    Alert.alert('Eliminar atleta', 'Eliminar a ' + name + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteAthlete(event.id, categoryId, athleteId) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={{ gap: Spacing.one }}>
          <ThemedText type="micro" themeColor="textSecondary">TORNEO</ThemedText>
          <ThemedText type="display">{event.name}</ThemedText>
          <ThemedText type="bodyStrong" themeColor="textSecondary">
            {event.startDate + ' - ' + event.endDate}
          </ThemedText>
          {event.federation ? (
            <ThemedText type="caption" themeColor="textSecondary">Federacion: {event.federation}</ThemedText>
          ) : null}
          {event.location ? (
            <ThemedText type="caption" themeColor="textSecondary">Lugar: {event.location}</ThemedText>
          ) : null}
          <View style={styles.metaRow}>
            <Pill label={event.categories.length + ' categorias'} />
            <Pill label={totalAthletes + ' atletas'} accent />
          </View>
        </Card>

        {event.categories.length === 0 ? (
          <Card variant="elevated" style={{ gap: Spacing.one }}>
            <ThemedText type="h2">Sin categorias</ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
              Crea categorias (por ejemplo, -83kg, -93kg) para empezar a cargar atletas.
            </ThemedText>
          </Card>
        ) : (
          <View style={{ gap: Spacing.two }}>
            {event.categories.map((c) => (
              <Card key={c.id} variant="elevated" style={{ gap: Spacing.two }}>
                <Pressable
                  onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}
                  onLongPress={() => confirmDeleteCategory(c.id, c.name)}
                  delayLongPress={350}
                >
                  <View style={styles.catRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="h2">{c.name}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {c.athletes.length} atletas - long-press para eliminar
                      </ThemedText>
                    </View>
                    <ThemedText type="h2" themeColor="textSecondary">{'>'}</ThemedText>
                  </View>
                </Pressable>

                {c.athletes.length > 0 ? (
                  <View style={{ gap: Spacing.one }}>
                    {c.athletes.map((a) => (
                      <Pressable
                        key={a.id}
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}
                        onLongPress={() => confirmDeleteAthlete(c.id, a.id, a.name)}
                        delayLongPress={350}
                        style={[
                          styles.athleteRow,
                          {
                            borderColor: a.isTeamMember ? theme.accent : theme.hairline,
                            backgroundColor: a.isTeamMember ? theme.accentSoft : 'transparent',
                          },
                        ]}
                      >
                        {a.isTeamMember ? (
                          <View
                            style={[
                              styles.teamBadge,
                              { backgroundColor: theme.accent },
                            ]}
                          >
                            <ThemedText type="micro" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                              EQUIPO
                            </ThemedText>
                          </View>
                        ) : null}
                        <ThemedText type="bodyStrong" style={{ flex: 1 }}>{a.name}</ThemedText>
                        <ThemedText type="caption" themeColor="textSecondary">
                          {a.bodyweightKg} {a.unit} {'-'} {a.gender}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                <Button
                  label="+ Agregar atleta"
                  variant="secondary"
                  tone="accent"
                  onPress={() => openAthleteModal(c.id)}
                  fullWidth
                />
              </Card>
            ))}
          </View>
        )}

        <Button label="+ Nueva categoria" onPress={() => setCategoryModal(true)} fullWidth />

        <Modal
          visible={categoryModal}
          animationType="slide"
          transparent
          onRequestClose={() => setCategoryModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <Card variant="elevated" style={{ gap: Spacing.three }}>
              <ThemedText type="h2">Nueva categoria</ThemedText>
              <Field
                label="Nombre (ej: -83kg, Open, Sub-junior)"
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="-83kg"
                error={categoryError}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Button label="Cancelar" variant="ghost" onPress={() => setCategoryModal(false)} style={{ flex: 1 }} />
                <Button label="Crear" onPress={submitCategory} style={{ flex: 1 }} />
              </View>
            </Card>
          </View>
        </Modal>

        <Modal
          visible={athleteModalFor !== null}
          animationType="slide"
          transparent
          onRequestClose={() => setAthleteModalFor(null)}
        >
          <View style={styles.modalBackdrop}>
            <Card variant="elevated" style={{ gap: Spacing.three }}>
              <ThemedText type="h2">Nuevo atleta</ThemedText>
              <Field
                label="Nombre"
                value={athleteName}
                onChangeText={setAthleteName}
                placeholder="Juan Perez"
                error={athleteError}
              />
              <Field
                label="Peso corporal"
                value={athleteBw}
                onChangeText={setAthleteBw}
                placeholder="82.5"
                keyboardType="decimal-pad"
              />
              <Segmented
                label="Unidad"
                value={athleteUnit}
                onValueChange={setAthleteUnit}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'lb', label: 'lb' },
                ]}
              />
              <Segmented
                label="Genero"
                value={athleteGender}
                onValueChange={setAthleteGender}
                options={[
                  { value: 'M', label: 'M' },
                  { value: 'F', label: 'F' },
                ]}
              />
              <Segmented
                label="Atleta del equipo"
                value={athleteIsTeam}
                onValueChange={setAthleteIsTeam}
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'si', label: 'Si' },
                ]}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Button label="Cancelar" variant="ghost" onPress={() => setAthleteModalFor(null)} style={{ flex: 1 }} />
                <Button label="Agregar" onPress={submitAthlete} style={{ flex: 1 }} />
              </View>
            </Card>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, accent }: { label: string; accent?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        borderRadius: 999,
        backgroundColor: accent ? theme.accent : theme.backgroundSelected,
      }}
    >
      <ThemedText
        type="micro"
        style={{ color: accent ? '#FFFFFF' : theme.text, fontWeight: '800' }}
      >
        {label}
      </ThemedText>
    </View>
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
  metaRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginTop: Spacing.one },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  teamBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
