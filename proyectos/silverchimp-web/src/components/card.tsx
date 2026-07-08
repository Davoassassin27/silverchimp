import { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { GradientView } from '@/components/gradient-view';
import {
  Radius,
  Shadow,
  Spacing,
  ThemeColor,
  getGradient,
  type GradientKey,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'flat' | 'elevated' | 'glass' | 'gradient' | 'accent';

export type CardProps = ViewProps & {
  bg?: ThemeColor;
  pad?: keyof typeof Spacing;
  variant?: CardVariant;
  gradientKey?: GradientKey;
  children?: ReactNode;
};

export function Card({
  style,
  bg,
  pad = 'three',
  variant = 'flat',
  gradientKey = 'hero',
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  const padValue = Spacing[pad];

  if (variant === 'gradient' || variant === 'accent') {
    const colors = getGradient(variant === 'accent' ? 'accent' : gradientKey, scheme);
    const flat = colors as unknown as readonly [string, string];
    return (
      <GradientView
        colors={flat}
        direction="diagonal-down"
        borderRadius={Radius.lg}
        style={[{ padding: padValue }, Shadow.md as ViewStyle, style]}
        {...rest}
      >
        {children}
      </GradientView>
    );
  }

  let containerStyle: ViewStyle = {
    backgroundColor: bg ? theme[bg] : theme.backgroundElement,
    borderRadius: Radius.lg,
    padding: padValue,
  };

  if (variant === 'elevated') {
    containerStyle = { ...containerStyle, ...Shadow.md };
  } else if (variant === 'glass') {
    containerStyle = {
      ...containerStyle,
      backgroundColor: theme.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.hairline,
      ...Shadow.sm,
    };
  } else {
    containerStyle = {
      ...containerStyle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.hairline,
    };
  }

  return (
    <View style={[containerStyle, style]} {...rest}>
      {children}
    </View>
  );
}
