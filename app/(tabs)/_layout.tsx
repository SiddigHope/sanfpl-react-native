import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../src/stores/themeStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#3D619B',
        tabBarInactiveTintColor: theme === 'dark' ? '#FFFFFF80' : '#00000080',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'transfers':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'price-changes':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'fixtures':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'predictions':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            default:
              iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
        }}
      />
      <Tabs.Screen
        name="my-team"
        options={{
          title: t('my_team'),
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: t('transfers'),
        }}
      />
      <Tabs.Screen
        name="price-changes"
        options={{
          title: t('price_changes'),
        }}
      />
    </Tabs>
  );
}
