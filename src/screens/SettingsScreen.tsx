import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguageStore } from '../stores/languageStore';
import { useThemeStore } from '../stores/themeStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{t('settings')}</ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Theme</ThemedText>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={toggleTheme}
        >
          <ThemedText>Current Theme: {theme}</ThemedText>
          <ThemedText style={styles.actionText}>Toggle</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Language</ThemedText>
        <TouchableOpacity
          style={[styles.settingButton, language === 'en' && styles.selectedButton]}
          onPress={() => handleLanguageChange('en')}
        >
          <ThemedText>English</ThemedText>
          {language === 'en' && (
            <ThemedText style={styles.selectedText}>✓</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingButton, language === 'ar' && styles.selectedButton]}
          onPress={() => handleLanguageChange('ar')}
        >
          <ThemedText>العربية</ThemedText>
          {language === 'ar' && (
            <ThemedText style={styles.selectedText}>✓</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>About</ThemedText>
        <View style={styles.settingButton}>
          <ThemedText>San FPL</ThemedText>
          <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E9E9EB',
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#3D619B',
  },
  actionText: {
    color: '#3D619B',
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  versionText: {
    opacity: 0.6,
  },
});