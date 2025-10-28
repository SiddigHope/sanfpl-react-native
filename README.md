# San FPL - Fantasy Premier League Companion App

A comprehensive Fantasy Premier League companion app built with React Native (Expo) that provides real-time data, statistics, and insights for FPL managers.

## 🌟 Features

- **Live Data**: Real-time updates from the official FPL API
- **Team Management**: View and manage your FPL team
- **Transfer Insights**: Smart transfer recommendations based on form and fixtures
- **Price Change Predictions**: Track player price changes
- **Multi-language Support**: English and Arabic localization
- **Theme Support**: Light and dark mode

## 🛠️ Tech Stack

- React Native (Expo SDK 52+)
- TypeScript
- Zustand (State Management)
- i18next (Localization)
- Axios (API Client)
- AsyncStorage (Local Storage)
- React Navigation

## 📱 Core Functionalities

### API Integration

Base API URL: `https://fantasy.premierleague.com/api/`

- Global bootstrap data: `/bootstrap-static/`
- User team data: `/entry/{team_id}/event/{gw}/picks/`
- Player details: `/element-summary/{player_id}/`
- Fixtures: `/fixtures/`
- Live points: `/event/{gw}/live/`

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sanfpl.git
cd sanfpl
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # for iOS
npm run android # for Android
npm run web     # for web
```

## 📱 Screens

1. **Home Dashboard**
   - Current Gameweek info
   - Deadline countdown
   - Top performing players
   - Quick action buttons

2. **My Team**
   - Team lineup visualization
   - Player performance stats
   - Team ID configuration

3. **Transfers**
   - Transfer recommendations
   - Form-based suggestions
   - Position filtering

4. **Price Changes**
   - Price rise/fall predictions
   - Position-based filtering
   - Historical price data

5. **Settings**
   - Theme toggle
   - Language selection
   - App preferences

## 🎨 Theming

The app uses a consistent color scheme across light and dark modes:

```typescript
light: {
  background: '#FFFFFF',
  text: '#111827',
  primary: '#3D619B',
  accent: '#EF4B4C',
  card: '#E9E9EB'
}

dark: {
  background: '#111827',
  text: '#FFFFFF',
  primary: '#3D619B',
  accent: '#EF4B4C',
  card: '#1F2937'
}
```

## 🌐 Localization

Supported languages:
- English (en)
- Arabic (ar)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# sanfpl-react-native
