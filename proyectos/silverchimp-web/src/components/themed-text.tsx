import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: keyof typeof TypeScale | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const scale = TypeScale[type as keyof typeof TypeScale];
  const flat = scale as { size: number; weight: '400' | '600' | '700' | '800'; line: number; letter: number };

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        flat
          ? {
              fontSize: flat.size,
              fontWeight: flat.weight,
              lineHeight: flat.line,
              letterSpacing: flat.letter,
            }
          : null,
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.link, { color: theme.accent }],
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontWeight: '600',
  },
  linkPrimary: {
    color: '#7A5AF8',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
