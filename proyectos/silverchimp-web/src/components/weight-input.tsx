import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GradientView } from '@/components/gradient-view';
import { Radius, getGradient } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface WeightInputProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  placeholder?: string;
}

function formatForInput(n: number): string {
  if (n === 0) return '';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function parseInput(raw: string): number {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function WeightInput({ value, onChange, step = 2.5, placeholder = '0' }: WeightInputProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [text, setText] = useState<string>(() => formatForInput(value));
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setText(formatForInput(value));
  }

  function bump(delta: number) {
    const next = Math.max(0, Math.round((value + delta) * 100) / 100);
    onChange(next);
  }

  const gradColors = getGradient('accent', scheme) as unknown as readonly [string, string];

  return (
    <View style={[styles.row, { borderColor: theme.hairline, backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => bump(-step)}
        style={[styles.btn, { borderRightColor: theme.hairline }]}
      >
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>{'-'}</Text>
      </Pressable>
      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={() => onChange(parseInput(text))}
        onSubmitEditing={() => onChange(parseInput(text))}
        keyboardType="decimal-pad"
        returnKeyType="done"
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
      />
      <GradientView
        colors={gradColors}
        direction="diagonal-down"
        style={styles.plusWrap}
      >
        <Pressable onPress={() => bump(step)} style={styles.plusPress}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>+</Text>
        </Pressable>
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  btn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  plusWrap: {
    width: 48,
  },
  plusPress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '700',
  },
});
