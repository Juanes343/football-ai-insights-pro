import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';
import { Brand } from '@/components/Brand';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.bgElevated, borderTopColor: theme.colors.border, height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: theme.colors.bg },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitle: () => <Brand size={20} />,
        headerTitleAlign: 'center',
        headerRight: () => (
          <MaterialCommunityIcons name="crown" size={20} color={theme.colors.gold} style={{ marginRight: 16 }} />
        ),
        sceneStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Panel', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="mundial"
        options={{ title: 'Mundial', tabBarIcon: ({ color, size }) => <Ionicons name="earth-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="matches"
        options={{ title: 'Partidos', tabBarIcon: ({ color, size }) => <Ionicons name="football-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="predictions"
        options={{ title: 'Predicciones', tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
