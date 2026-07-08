import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Field } from '@/components/field';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useEventStore } from '@/domain/event-store';
import { useTheme } from '@/hooks/use-theme';

export default function EventsScreen() {
  const theme = useTheme();
  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [federation, setFederation] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!name.trim()) return setError('Nombre obligatorio');
    if (!start.trim()) return setError('Fecha inicio obligatoria (AAAA-MM-DD)');
    if (!end.trim()) return setError('Fecha fin obligatoria (AAAA-MM-DD)');
    if (start.trim() > end.trim()) return setError('La fecha fin debe ser posterior a la inicio');
    const id = addEvent({
      name: name.trim(),
      startDate: start.trim(),
      endDate: end.trim(),
      federation: federation.trim() || undefined,
      location: location.trim() || undefined,
    });
    setName('');
    setStart('');
    setEnd('');
    setFederation('');
    setLocation('');
    setError('');
    setOpen(false);
    router.push({ pathname: '/event/[id]', params: { id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={{ marginBottom: Spacing.one }}>
          Eventos
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
          Torneos que vas a gestionar.
        </ThemedText>

        {events.length === 0 ? (
          <Card variant="elevated" style={{ gap: Spacing.one }}>
            <ThemedText type="h2">Sin eventos</ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
              Crea un torneo con su rango de fechas para empezar a cargar atletas y tiros.
            </ThemedText>
          </Card>
        ) : (
          <View style={{ gap: Spacing.two, marginBottom: Spacing.three }}>
            {events.map((ev) => {
              const totalAthletes = ev.categories.reduce((acc, c) => acc + c.athletes.length, 0);
              return (
                <Pressable
                  key={ev.id}
                  onLongPress={() => deleteEvent(ev.id)}
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: ev.id } })}
                >
                  <Card variant="elevated" style={styles.row}>
                    <View style={{ flex: 1, gap: Spacing.one }}>
                      <ThemedText type="h2">{ev.name}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {ev.startDate + ' - ' + ev.endDate}
                        {ev.federation ? ' - ' + ev.federation : ''}
                        {ev.location ? ' - ' + ev.location : ''}
                      </ThemedText>
                      <View style={styles.meta}>
                        <Pill label={ev.categories.length + ' cat.'} />
                        <Pill label={totalAthletes + ' atletas'} accent />
                      </View>
                    </View>
                    <ThemedText type="h2" themeColor="textSecondary">{'>'}</ThemedText>
                  </Card>
                </Pressable>
              );
            })}
            <ThemedText type="caption" themeColor="textSecondary" style={{ textAlign: 'center', marginTop: Spacing.two }}>
              Long-press en un evento para eliminarlo
            </ThemedText>
          </View>
        )}

        <Button label="+ Nuevo evento" onPress={() => setOpen(true)} fullWidth />

        <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
          <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.modalHead}>
              <Pressable onPress={() => setOpen(false)}>
                <ThemedText type="link">Cancelar</ThemedText>
              </Pressable>
              <ThemedText type="h2">Nuevo evento</ThemedText>
              <Pressable onPress={submit}>
                <ThemedText type="linkPrimary">Crear</ThemedText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form}>
              <Card variant="elevated" style={{ gap: Spacing.three }}>
                <Field label="Nombre del torneo" value={name} onChangeText={setName} placeholder="Copa Plata 2026" />
                <Field
                  label="Fecha inicio (AAAA-MM-DD)"
                  value={start}
                  onChangeText={setStart}
                  placeholder="2026-07-04"
                />
                <Field
                  label="Fecha fin (AAAA-MM-DD)"
                  value={end}
                  onChangeText={setEnd}
                  placeholder="2026-07-05"
                />
                <Field
                  label="Federacion (opcional)"
                  value={federation}
                  onChangeText={setFederation}
                  placeholder="IPF"
                />
                <Field
                  label="Lugar (opcional)"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Gimnasio X"
                />
                {error ? (
                  <ThemedText type="caption" style={{ color: theme.fail }}>
                    {error}
                  </ThemedText>
                ) : null}
              </Card>
              <Button label="Crear evento" onPress={submit} fullWidth />
            </ScrollView>
          </SafeAreaView>
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
      <Text style={{ color: accent ? '#FFFFFF' : theme.text, fontSize: 11, fontWeight: '800' }}>
        {label}
      </Text>
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
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  meta: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  modal: { flex: 1, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  form: { padding: Spacing.four, gap: Spacing.three },
});
