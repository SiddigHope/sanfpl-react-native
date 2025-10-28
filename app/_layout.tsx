import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
// import '../src/i18n';
import { StackNavigator } from '@/src/navigation/StackNavigator';
import { useLanguageStore } from '../src/stores/languageStore';
import { useThemeStore } from '../src/stores/themeStore';

export default function RootLayout() {
  const theme = useThemeStore((state) => state.theme);
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    // Initialize any app-wide configurations here
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <StackNavigator />
      {/* <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
          },
          headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack> */}
    </>
  );
}
