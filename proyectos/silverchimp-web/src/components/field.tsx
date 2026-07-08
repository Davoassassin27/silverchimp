import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'number-pad';
  error?: string;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', error }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.one + 2 }}>
      <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
        style={[
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderWidth: 1,
            borderColor: error ? theme.fail : theme.hairline,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.three,
            ...TypeScale.body,
            fontWeight: '600',
          },
        ]}
      />
      {error ? (
        <Text style={{ color: theme.fail, ...TypeScale.caption }}>{error}</Text>
      ) : null}
    </View>
  );
}

export interface PickerProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onValueChange: (v: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onValueChange }: PickerProps<T>) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.one + 2 }}>
      <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>
        {label.toUpperCase()}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.one,
          padding: 3,
          backgroundColor: theme.background,
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: theme.hairline,
        }}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onValueChange(o.value)}
              style={{
                flex: 1,
                paddingVertical: Spacing.two + 2,
                borderRadius: Radius.sm,
                backgroundColor: selected ? theme.accent : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: selected ? '#FFFFFF' : theme.text,
                  ...TypeScale.caption,
                  fontWeight: '800',
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface NumberStepperProps {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function NumberStepper({ label, value, step, onChange, suffix }: NumberStepperProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.one + 2 }}>
      <Text style={{ color: theme.textSecondary, ...TypeScale.micro }}>
        {label.toUpperCase()}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        <Pressable
          onPress={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))}
          style={[styles.step, { backgroundColor: theme.backgroundElement, borderColor: theme.hairline }]}
        >
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>{'-'}</Text>
        </Pressable>
        <View style={[styles.valueBox, { backgroundColor: theme.backgroundElement, borderColor: theme.hairline }]}>
          <Text style={{ color: theme.text, ...TypeScale.h2 }}>
            {value}
            {suffix ? ' ' + suffix : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => onChange(Math.round((value + step) * 100) / 100)}
          style={[styles.step, { backgroundColor: theme.accent, borderColor: theme.accent }]}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  valueBox: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
