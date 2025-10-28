import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { CaptaincyRankingScreen } from '../screens/CaptaincyRankingScreen';
// import { HomeScreen } from '../screens/HomeScreen';
// import { PredictedPointsScreen } from '../screens/PredictedPointsScreen';
import HomeScreen from '../screens/HomeScreen';
import { PredictedPointsScreen } from '../screens/PredictedPointsScreen';
import PriceChangesScreen from '../screens/PriceChangesScreen';
import TransfersScreen from '../screens/TransfersScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Transfers':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'Price Changes':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Captaincy':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'Predictions':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            default:
              iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transfers" component={TransfersScreen} />
      <Tab.Screen name="Price Changes" component={PriceChangesScreen} />
      <Tab.Screen name="Captaincy" component={CaptaincyRankingScreen} />
      <Tab.Screen name="Predictions" component={PredictedPointsScreen} />
    </Tab.Navigator>
  );
};