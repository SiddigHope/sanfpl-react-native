import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TextInput } from 'react-native';
import { TeamPitch } from '../components/TeamPitch';
import { useFPLStore } from '../stores/fplStore';

const TEAM_ID_KEY = '@sanfpl:team_id';

export default function MyTeamScreen({navigation}: any) {
  const { t } = useTranslation();
  const {
    teamId,
    setTeamId,
    userTeam,
    currentGameweek,
    players,
    teams,
    isLoading,
    fetchUserTeam
  } = useFPLStore();

  const [inputTeamId, setInputTeamId] = useState(teamId || '');

  useEffect(() => {
    loadSavedTeamId();
  }, []);

  // console.log({...userTeam,picks:{}});
  

  useEffect(() => {
    if (teamId) {
      fetchUserTeam(currentGameweek);
    }
  }, [teamId, currentGameweek]);

  const loadSavedTeamId = async () => {
    try {
      // AsyncStorage.removeItem(TEAM_ID_KEY)
      const savedTeamId = await AsyncStorage.getItem(TEAM_ID_KEY);
      if (savedTeamId) {
        setTeamId(savedTeamId);
        setInputTeamId(savedTeamId);
      }
    } catch (error) {
      console.error('Error loading team ID:', error);
    }
  };

  const handleTeamIdSubmit = async () => {
    if (inputTeamId) {
      await AsyncStorage.setItem(TEAM_ID_KEY, inputTeamId);
      setTeamId(inputTeamId);
    }
  };

const organizePlayersByPosition = () => {
  if (!userTeam?.picks || !players.length) {
    return {
      goalkeepers: { picked: [], benched: [] },
      defenders: { picked: [], benched: [] },
      midfielders: { picked: [], benched: [] },
      forwards: { picked: [], benched: [] },
      benched: []
    };
  }

  const organized = userTeam.picks.reduce((acc: any, pick: any) => {
    const player = players.find(p => p.id === pick.element);
    if (!player) return acc;

    const team = teams.find(t => t.id === player.team);

    const enrichedPlayer = {
      ...player,
      team_short_name: team?.short_name || '',
      positionName: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
      isBenched: pick.multiplier === 0,
      isBenchGoalkeeper: pick.position === 12, // 🧤 mark bench GK
      pickInfo: pick
    };

    const positionKey = ['goalkeepers', 'defenders', 'midfielders', 'forwards'][player.element_type - 1];
    const statusKey = enrichedPlayer.isBenched ? 'benched' : 'picked';

    // push into main positional groups
    acc[positionKey][statusKey].push(enrichedPlayer);

    // also push into benched array if multiplier = 0
    if (enrichedPlayer.isBenched) {
      acc.benched.push(enrichedPlayer);
    }

    return acc;
  }, {
    goalkeepers: { picked: [], benched: [] },
    defenders: { picked: [], benched: [] },
    midfielders: { picked: [], benched: [] },
    forwards: { picked: [], benched: [] },
    benched: []
  });

  // sort benched players by their FPL position (12–15)
  organized.benched.sort((a:any, b:any) => a.pickInfo.position - b.pickInfo.position);

  return organized;
};


  const teamPlayers = organizePlayersByPosition();

  const onPlayerPress = (player:any) => {
    navigation.navigate('PlayerFixtureInfo',{player,playerId: player.id, fixtureId:currentGameweek })
  }

  if (!teamId) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>{t('enter_team_id')}</ThemedText>
        <TextInput
          style={styles.input}
          value={inputTeamId}
          onChangeText={setInputTeamId}
          keyboardType="numeric"
          placeholder="Team ID"
          onSubmitEditing={handleTeamIdSubmit}
          returnKeyType="done"
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => fetchUserTeam(currentGameweek)}
        />
      }
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{t('my_team')}</ThemedText>
        <ThemedText style={styles.gameweek}>
          Gameweek {currentGameweek}
        </ThemedText>
      </ThemedView>

      <TeamPitch
        goalkeepers={teamPlayers.goalkeepers?.picked}
        defenders={teamPlayers.defenders?.picked}
        midfielders={teamPlayers.midfielders?.picked}
        forwards={teamPlayers.forwards?.picked}
        bench={teamPlayers.benched}
        showBench={true}
        showTotalPoints={true}
        showGwRanking={true}
        totalPoints={userTeam?.entry_history?.points}
        overallRanking={userTeam?.entry_history?.overall_rank}
        gwRanking={userTeam?.entry_history?.rank}
        onPlayerPress={onPlayerPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gameweek: {
    fontSize: 16,
    opacity: 0.8,
  },
  input: {
    height: 40,
    margin: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#3D619B',
  },
});