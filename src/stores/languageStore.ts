import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        i18next.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize i18next
i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          home: 'Home',
          my_team: 'My Team',
          transfers: 'Transfers',
          price_changes: 'Price Changes',
          settings: 'Settings',
          enter_team_id: 'Enter Your Team ID',
          refresh: 'Pull to refresh',
          loading: 'Loading...',
          error: 'Something went wrong',
          try_again: 'Try Again',
        },
      },
      ar: {
        translation: {
          home: 'الرئيسية',
          my_team: 'فريقي',
          transfers: 'الانتقالات',
          price_changes: 'تغير الأسعار',
          settings: 'الإعدادات',
          enter_team_id: 'أدخل رقم فريقك',
          refresh: 'اسحب للتحديث',
          loading: 'جاري التحميل...',
          error: 'حدث خطأ ما',
          try_again: 'حاول مرة أخرى',
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });