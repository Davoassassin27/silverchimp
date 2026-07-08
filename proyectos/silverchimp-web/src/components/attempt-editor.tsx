import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { GradientView } from '@/components/gradient-view';
import { ResultToggle } from '@/components/result-toggle';
import { WeightInput } from '@/components/weight-input';
import { Radius, Spacing, TypeScale, getGradient } from '@/constants/theme';
import type { Attempt, AttemptResult, LiftKind } from '@/domain/schema';
import { LIFT_LABEL } from '@/domain/schema';
import { formatKg, type RecommendedAttempt } from '@/domain/scoring';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface AttemptEditorProps {
  visible: boolean;
  athleteName: string;
  lift: LiftKind;
  index: number;
  attempt: Attempt;
  recommendation: RecommendedAttempt;
  onClose: () => void;
  onSave: (weightKg: number, result: AttemptResult) => void;
  onClear?: () => void;
}

export function AttemptEditor({
  visible,
  athleteName,
  lift,
  index,
  attempt,
  recommendation,
  onClose,
  onSave,
  onClear,
}: AttemptEditorProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const initialWeight = attempt.weightKg > 0 ? attempt.weightKg : recommendation.weightKg;
  const [weight, setWeight] = useState<number>(initialWeight);
  const [result, setResult] = useState<AttemptResult>(attempt.result);
  const [initKey, setInitKey] = useState<string>(
    visible + '|' + attempt.weightKg + '|' + attempt.result + '|' + recommendation.weightKg
  );

  const currentKey = visible + '|' + attempt.weightKg + '|' + attempt.result + '|' + recommendation.weightKg;
  if (currentKey !== initKey) {
    setInitKey(currentKey);
    setWeight(attempt.weightKg > 0 ? attempt.weightKg : recommendation.weightKg);
    setResult(attempt.result);
  }

  const liftColors = getGradient(lift, scheme) as unknown as readonly [string, string];

  const recLabel =
    recommendation.source === 'to-win'
      ? 'Para ganar: ' + formatKg(recommendation.weightKg)
      : recommendation.source === 'progression'
        ? 'Progresion: ' + formatKg(recommendation.weightKg)
        : recommendation.source === 'retry'
          ? 'Retry: ' + formatKg(recommendation.weightKg)
          : 'Recomendado: 0kg';

  const recColor =
    recommendation.source === 'to-win'
      ? theme.accent
      : recommendation.source === 'retry'
        ? theme.fail
        : theme.textSecondary;

  function save() {
    const finalWeight = Math.max(0, Math.round(weight * 100) / 100);
    const finalResult: AttemptResult = finalWeight === 0 ? 'pending' : result;
    onSave(finalWeight, finalResult);
  }

  function useRecommended() {
    setWeight(recommendation.weightKg);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.hairline }]}
          onPress={() => undefined}
        >
          <GradientView
            colors={liftColors}
            direction="diagonal-down"
            borderRadius={Radius.lg}
            style={styles.header}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#FFFFFFCC',
                  ...TypeScale.micro,
                }}
              >
                {athleteName.toUpperCase()}
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  ...TypeScale.h1,
                  marginTop: 2,
                }}
              >
                {LIFT_LABEL[lift] + ' - ' + (index + 1) + ' intento'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                {String.fromCharCode(10005)}
              </Text>
            </Pressable>
          </GradientView>

          <View style={{ padding: Spacing.four, gap: Spacing.three }}>
            <Pressable
              onPress={useRecommended}
              style={[
                styles.recChip,
                { backgroundColor: theme.background, borderColor: recColor },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: recColor, ...TypeScale.bodyStrong, fontWeight: '800' }}>
                  {recLabel}
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    ...TypeScale.caption,
                    marginTop: 2,
                  }}
                >
                  {recommendation.detail}
                </Text>
              </View>
              <View
                style={[
                  styles.applyChip,
                  { backgroundColor: recColor },
                ]}
              >
                <Text style={{ color: '#FFFFFF', ...TypeScale.caption, fontWeight: '800' }}>
                  APLICAR
                </Text>
              </View>
            </Pressable>

            <View style={{ gap: Spacing.one + 2 }}>
              <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>PESO</Text>
              <WeightInput value={weight} onChange={setWeight} />
              {weight === 0 ? (
                <Text style={{ color: theme.textSecondary, ...TypeScale.caption }}>
                  Peso 0 = pendiente. Define el peso para poder validar o nulificar.
                </Text>
              ) : null}
            </View>

            <View style={{ gap: Spacing.one + 2 }}>
              <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>RESULTADO</Text>
              <ResultToggle
                value={weight === 0 ? 'pending' : result}
                onChange={setResult}
              />
            </View>

            <View style={styles.actions}>
              {onClear ? (
                <Button label="Limpiar" variant="ghost" onPress={onClear} size="sm" style={{ flex: 1 }} />
              ) : null}
              <Button label="Cancelar" variant="ghost" onPress={onClose} size="md" style={{ flex: 1 }} />
              <Button label="Guardar" onPress={save} size="md" style={{ flex: 1 }} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  applyChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
