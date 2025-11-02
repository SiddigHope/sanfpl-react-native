import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { CaptaincyRankingScreen } from '../screens/CaptaincyRankingScreen';
import { MatchDetails } from '../screens/MatchDetails';
import MyTeamScreen from '../screens/MyTeamScreen';
import { PlayerFixtureInfo } from '../screens/PlayerFixtureInfo';
import { PlayerInfoScreen } from '../screens/PlayerInfoScreen';
import { TeamRatingScreen } from '../screens/TeamRatingScreen';
import TransferPlayerSelection from '../screens/TransferPlayerSelection';
import { TabNavigator } from './TabNavigator';

const Stack = createStackNavigator();

export const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TeamRating" 
        component={TeamRatingScreen} 
        options={{ title: 'Team Rating' }}
      />
      <Stack.Screen 
        name="MyTeam" 
        component={MyTeamScreen} 
        options={{ title: 'My Team' }}
      />
      <Stack.Screen 
        name="PlayerInfo" 
        component={PlayerInfoScreen} 
        options={({ route }) => ({ 
          title: route.params?.playerName || 'Player Info'
        })}
      />
      <Stack.Screen 
        name="TransferPlayerSelection" 
        component={TransferPlayerSelection} 
        options={({ route }) => ({ 
          title: route.params?.selectedPlayer?.web_name || 'Transfer Player'
        })}
      />
      <Stack.Screen 
        name="Captaincy" 
        component={CaptaincyRankingScreen} 
        options={{ title: 'Captaincy' }}
      />
      <Stack.Screen 
        name="MatchDetails" 
        component={MatchDetails} 
        options={{ title: 'Match Details' }}
      />
      <Stack.Screen 
        name="PlayerFixtureInfo" 
        component={PlayerFixtureInfo} 
        options={({ route }) => ({ 
          title: route.params?.player?.web_name || 'Fixture Stats'
        })}
      />
    </Stack.Navigator>
  );
};