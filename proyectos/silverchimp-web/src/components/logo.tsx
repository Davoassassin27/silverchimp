import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export interface LogoProps {
  size?: number;
}

export function Logo({ size = 64 }: LogoProps) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Defs>
          <LinearGradient id="silverFur" x1="64" y1="96" x2="448" y2="448" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#E6E8EC" />
            <Stop offset="0.5" stopColor="#B8BFCA" />
            <Stop offset="1" stopColor="#7A828F" />
          </LinearGradient>
          <LinearGradient id="silverBack" x1="120" y1="200" x2="392" y2="360" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#D7DBE1" />
            <Stop offset="1" stopColor="#8A929E" />
          </LinearGradient>
          <LinearGradient id="laptopBody" x1="156" y1="336" x2="356" y2="412" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#3A3F47" />
            <Stop offset="1" stopColor="#1B1E23" />
          </LinearGradient>
          <LinearGradient id="screenGlow" x1="214" y1="252" x2="298" y2="320" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#7A5AF8" />
            <Stop offset="1" stopColor="#A78BFA" />
          </LinearGradient>
        </Defs>

        <Rect width="512" height="512" rx="112" fill={theme.background} />

        <Path
          d="M150 232c-26 30-40 78-30 124 8 38 38 64 78 72 38 8 86-2 116-32 28-28 36-66 26-104-10-40-44-70-86-78-44-8-90 0-104 18z"
          fill="url(#silverBack)"
        />
        <Ellipse cx="256" cy="180" rx="86" ry="78" fill="url(#silverFur)" />
        <Circle cx="178" cy="142" r="26" fill="#9AA1AC" />
        <Circle cx="334" cy="142" r="26" fill="#9AA1AC" />
        <Circle cx="178" cy="142" r="12" fill="#5C6470" />
        <Circle cx="334" cy="142" r="12" fill="#5C6470" />
        <Ellipse cx="256" cy="208" rx="58" ry="46" fill="#3A2E26" />
        <Ellipse cx="256" cy="214" rx="46" ry="36" fill="#5A4636" />
        <Path d="M214 96c14-10 64-10 78 2 8 8 6 18-4 22-22 8-58 6-74-4-10-6-10-14 0-20z" fill="#E6E8EC" />
        <Path d="M214 186l20 6M298 186l-20 6" stroke="#0B0C0E" strokeWidth="6" strokeLinecap="round" />
        <Rect x="208" y="166" width="96" height="10" rx="5" fill="#B0B6BE" opacity={0.7} />
        <Ellipse cx="246" cy="218" rx="4" ry="6" fill="#0B0C0E" />
        <Ellipse cx="266" cy="218" rx="4" ry="6" fill="#0B0C0E" />
        <Path d="M238 232c8 6 30 6 38 0" stroke="#0B0C0E" strokeWidth="5" strokeLinecap="round" />
        <Path d="M150 312c-30 18-30 56-10 76 16 16 44 18 62 4l-6-40-46-40z" fill="url(#silverFur)" />
        <Path d="M362 312c30 18 30 56 10 76-16 16-44 18-62 4l6-40 46-40z" fill="url(#silverFur)" />
        <Path d="M140 416c0-8 6-14 14-14h204c8 0 14 6 14 14v6l-232 14v-20z" fill="url(#laptopBody)" />
        <Rect x="156" y="330" width="200" height="92" rx="10" fill="url(#laptopBody)" />
        <Rect x="168" y="342" width="176" height="68" rx="6" fill="#0B0C0E" />
        <Rect x="180" y="354" width="152" height="44" fill="url(#screenGlow)" />
        <Rect x="190" y="378" width="14" height="20" fill={theme.squat} />
        <Rect x="216" y="368" width="14" height="30" fill={theme.bench} />
        <Rect x="242" y="358" width="14" height="40" fill={theme.deadlift} />
        <Rect x="268" y="372" width="14" height="26" fill="#FFFFFF" opacity={0.85} />
        <Rect x="294" y="384" width="14" height="14" fill="#FFFFFF" opacity={0.6} />
        <Rect x="320" y="380" width="14" height="18" fill="#FFFFFF" opacity={0.7} />
        <Rect x="206" y="412" width="100" height="4" rx="2" fill="#5C6470" />
        <Ellipse cx="220" cy="448" rx="26" ry="10" fill="#5C6470" opacity={0.5} />
        <Ellipse cx="292" cy="448" rx="26" ry="10" fill="#5C6470" opacity={0.5} />
      </Svg>
    </View>
  );
}