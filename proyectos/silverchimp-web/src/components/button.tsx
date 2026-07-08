import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { GradientView } from '@/components/gradient-view';
import {
  Radius,
  Shadow,
  Spacing,
  getGradient,
  type GradientKey,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
export type ButtonTone = 'accent' | 'team' | 'success' | 'fail' | 'silver';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const TONE_TO_GRADIENT: Record<ButtonTone, GradientKey> = {
  accent: 'accent',
  team: 'team',
  success: 'success',
  fail: 'fail',
  silver: 'silver',
};

export function Button({
  label,
  variant = 'primary',
  tone = 'accent',
  fullWidth,
  size = 'md',
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [pressed, setPressed] = useState(false);

  const height = size === 'sm' ? 36 : size === 'lg' ? 56 : 46;
  const padH = size === 'sm' ? Spacing.three : Spacing.four;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 17 : 15;

  const base: ViewStyle = {
    height,
    paddingHorizontal: padH,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  };

  const wrapStyle: ViewStyle = {
    alignSelf: fullWidth ? 'stretch' : 'auto',
    borderRadius: Radius.md,
    transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }],
  };

  let content: React.ReactNode;

  if (variant === 'primary' || variant === 'danger') {
    const gradKey: GradientKey = variant === 'danger' ? 'fail' : TONE_TO_GRADIENT[tone];
    const colors = getGradient(gradKey, scheme);
    const flat = colors as unknown as readonly [string, string];
    content = (
      <GradientView
        colors={flat}
        direction="diagonal-down"
        borderRadius={Radius.md}
        style={[base, Shadow.sm as ViewStyle]}
      >
        <Text style={[styles.label, { color: '#FFFFFF', fontSize }]}>{label}</Text>
      </GradientView>
    );
  } else if (variant === 'secondary') {
    const colors = getGradient(TONE_TO_GRADIENT[tone], scheme);
    const accent = colors[0];
    content = (
      <View
        style={[
          base,
          {
            backgroundColor: theme.backgroundElement,
            borderWidth: 1.5,
            borderColor: accent,
          },
        ]}
      >
        <Text style={[styles.label, { color: accent, fontSize }]}>{label}</Text>
      </View>
    );
  } else if (variant === 'glass') {
    content = (
      <View
        style={[
          base,
          {
            backgroundColor: theme.glass,
            borderWidth: 1,
            borderColor: theme.hairline,
            ...Shadow.sm,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.text, fontSize }]}>{label}</Text>
      </View>
    );
  } else {
    content = (
      <View
        style={[
          base,
          {
            backgroundColor: 'transparent',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.hairline,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.text, fontSize }]}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[wrapStyle, style as ViewStyle]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
