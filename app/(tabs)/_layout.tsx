import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../src/stores/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3D619B',
        tabBarInactiveTintColor: theme === 'dark' ? '#FFFFFF80' : '#00000080',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-team"
        options={{
          title: t('my_team'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: t('transfers'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="price-changes"
        options={{
          title: t('price_changes'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
