import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GradientView } from '@/components/gradient-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function TabBarBackground() {
  const theme = useTheme();
  return (
    <GradientView
      colors={[theme.glass, theme.glass]}
      direction="vertical"
      style={StyleSheet.absoluteFill}
    />
  );
}

function TabItem({ label, focused }: { label: string; focused: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 22,
          height: 3,
          borderRadius: 999,
          backgroundColor: focused ? theme.accent : 'transparent',
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.3,
          color: focused ? theme.text : theme.textSecondary,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: Spacing.three,
          right: Spacing.three,
          bottom: Spacing.three,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: Radius.xl,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 12,
          borderWidth: 1,
          borderColor: theme.hairline,
          overflow: 'hidden',
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabel: ({ focused, children }) => (
          <TabItem label={String(children)} focused={focused} />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="events" options={{ title: 'Eventos' }} />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}
