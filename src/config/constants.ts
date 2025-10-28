export const APP_CONFIG = {
  APP_NAME: 'San FPL',
  VERSION: '1.0.0',
  API_BASE_URL: 'https://fantasy.premierleague.com/api',
  CACHE_CONFIG: {
    EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes
    STORAGE_PREFIX: '@sanfpl:cache:',
  },
  STORAGE_KEYS: {
    TEAM_ID: '@sanfpl:team_id',
    THEME: '@sanfpl:theme',
    LANGUAGE: '@sanfpl:language',
    CACHED_PRICES: '@sanfpl:cached_prices',
  },
  THEME: {
    LIGHT: {
      background: '#FFFFFF',
      text: '#111827',
      primary: '#3D619B',
      accent: '#EF4B4C',
      card: '#E9E9EB',
      border: '#D1D5DB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    DARK: {
      background: '#111827',
      text: '#FFFFFF',
      primary: '#3D619B',
      accent: '#EF4B4C',
      card: '#1F2937',
      border: '#374151',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
  },
  POSITIONS: {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD',
  },
  REFRESH_INTERVALS: {
    LIVE_POINTS: 60 * 1000, // 1 minute
    PRICE_CHANGES: 5 * 60 * 1000, // 5 minutes
    FIXTURES: 5 * 60 * 1000, // 5 minutes
    GENERAL_DATA: 5 * 60 * 1000, // 5 minutes
  },
  DEFAULT_SETTINGS: {
    THEME: 'light',
    LANGUAGE: 'en',
    AUTO_REFRESH: true,
  },
  UI: {
    CARD_BORDER_RADIUS: 12,
    BUTTON_BORDER_RADIUS: 8,
    INPUT_BORDER_RADIUS: 8,
    SPACING: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    TYPOGRAPHY: {
      h1: 24,
      h2: 20,
      h3: 18,
      body: 16,
      small: 14,
      tiny: 12,
    },
  },
};