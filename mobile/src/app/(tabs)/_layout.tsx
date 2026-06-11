import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/lib/theme';
import { Brand } from '@/components/Brand';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.bgElevated, borderTopColor: theme.colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: theme.colors.bg },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitle: () => <Brand size={18} />,
        headerTitleAlign: 'center',
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
