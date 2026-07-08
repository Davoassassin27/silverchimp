import { ReactNode, useId, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';

interface GradientViewProps {
  colors: readonly [string, string] | readonly [string, string, string];
  direction?: GradientDirection;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  borderRadius?: number;
}

const DIRS: Record<GradientDirection, { x1: string; y1: string; x2: string; y2: string }> = {
  horizontal: { x1: '0%', y1: '50%', x2: '100%', y2: '50%' },
  vertical: { x1: '50%', y1: '0%', x2: '50%', y2: '100%' },
  'diagonal-down': { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
  'diagonal-up': { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
};

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function GradientView({
  colors,
  direction = 'diagonal-down',
  style,
  children,
  borderRadius,
}: GradientViewProps) {
  const dir = DIRS[direction];
  const reactId = useId();
  const id = useMemo(
    () => 'gv_' + reactId.replace(/:/g, '') + '_' + hash(colors.join(',') + direction),
    [reactId, colors, direction]
  );

  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1={dir.x1} y1={dir.y1} x2={dir.x2} y2={dir.y2}>
            {colors.map((c, i) => (
              <Stop
                key={i}
                offset={i / (colors.length - 1)}
                stopColor={c}
                stopOpacity={1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={'url(#' + id + ')'} />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
  },
});
