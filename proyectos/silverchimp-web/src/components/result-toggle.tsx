import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, TypeScale } from '@/constants/theme';
import type { AttemptResult } from '@/domain/schema';
import { useTheme } from '@/hooks/use-theme';

interface ResultToggleProps {
  value: AttemptResult;
  onChange: (next: AttemptResult) => void;
  size?: 'sm' | 'md';
}

const ORDER: AttemptResult[] = ['pending', 'valid', 'null'];
const LABEL: Record<AttemptResult, string> = {
  pending: '-',
  valid: 'V',
  null: 'N',
};

export function ResultToggle({ value, onChange, size = 'md' }: ResultToggleProps) {
  const theme = useTheme();
  const h = size === 'sm' ? 32 : 40;
  return (
    <View
      style={[
        styles.row,
        {
          height: h,
          backgroundColor: theme.background,
          borderColor: theme.hairline,
        },
      ]}
    >
      {ORDER.map((r, i) => {
        const selected = r === value;
        const activeColor =
          r === 'valid' ? theme.success : r === 'null' ? theme.fail : theme.textSecondary;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={[
              styles.cell,
              {
                backgroundColor: selected ? activeColor : 'transparent',
                borderLeftWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                borderColor: theme.hairline,
              },
            ]}
          >
            <Text
              style={[
                {
                  color: selected ? '#FFFFFF' : activeColor,
                  ...TypeScale.bodyStrong,
                  fontWeight: '800',
                },
              ]}
            >
              {LABEL[r]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
