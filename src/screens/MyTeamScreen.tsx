import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EnterTeamIdTextInput from '../components/EnterTeamIdTextInput';
import { TeamPitch } from '../components/TeamPitch';
import { useFPLStore } from '../stores/fplStore';
import { formatRank } from '../utils/fplUtils';

const TEAM_ID_KEY = '@sanfpl:team_id';

export default function MyTeamScreen({ navigation }: any) {
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
  const [weekOffset, setWeekOffset] = useState(0);

  const activeGameweek = currentGameweek + weekOffset;

  useEffect(() => {
    loadSavedTeamId();
  }, []);

  // console.log({...userTeam,picks:{}});


  useEffect(() => {
    if (teamId) {
      fetchUserTeam(activeGameweek);
    }
  }, [teamId, activeGameweek]);

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
    organized.benched.sort((a: any, b: any) => a.pickInfo.position - b.pickInfo.position);

    return organized;
  };


  const teamPlayers = organizePlayersByPosition();

  const onPlayerPress = (player: any) => {
    navigation.navigate('PlayerFixtureInfo', { player, playerId: player.id, fixtureId: currentGameweek })
  }

  const handleNext = () => {
    if(currentGameweek === activeGameweek) return
    setWeekOffset((p) => p + 1);
  }
  const handlePrev = () => setWeekOffset((p) => (p > -currentGameweek ? p - 1 : p));


  if (!teamId) {
    return (
      <EnterTeamIdTextInput />
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
        {/* <ThemedText style={styles.title}>{t('my_team')}</ThemedText> */}
        {/* <ThemedText style={styles.gameweek}>
          Gameweek {currentGameweek}
        </ThemedText> */}

        <View style={styles.fixtureContainer}>
          <TouchableOpacity style={styles.arrow} onPress={handlePrev}>
            <Ionicons name="chevron-back-outline" size={20} />
          </TouchableOpacity>
          <ThemedText style={styles.headerText}>GameWeek {activeGameweek}</ThemedText>
          <TouchableOpacity style={styles.arrow} onPress={handleNext}>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.topCardsContainer}>
          <ThemedView style={styles.pointsContainer}>
            <ThemedText style={[styles.points, { fontWeight: '600' }]}>{formatRank(userTeam?.entry_history?.rank || 0)}</ThemedText>
            <Text style={[styles.points, { color: 'grey' }]}>{"GW-Rank"}</Text>
          </ThemedView>
          <ThemedView style={styles.pointsContainer}>
            <ThemedText style={[styles.points, { fontWeight: '600' }]}>{userTeam?.entry_history?.points}</ThemedText>
            <Text style={[styles.points, { color: 'grey' }]}>{"Points"}</Text>
          </ThemedView>
          <ThemedView style={styles.pointsContainer}>
            <ThemedText style={[styles.points, { fontWeight: '600' }]}>{formatRank(userTeam?.entry_history?.overall_rank || 0)}</ThemedText>
            <Text style={[styles.points, { color: 'grey' }]}>{"Overall"}</Text>
          </ThemedView>
        </View>
      </ThemedView>

      <TeamPitch
        goalkeepers={teamPlayers.goalkeepers?.picked}
        defenders={teamPlayers.defenders?.picked}
        midfielders={teamPlayers.midfielders?.picked}
        forwards={teamPlayers.forwards?.picked}
        bench={teamPlayers.benched}
        showBench={true}
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
    // marginBottom: 16,
  },
  fixtureContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    // marginBottom: 5
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600"
  },
  arrow: {
    backgroundColor: '#e3e3e3',
    padding: 8,
    borderRadius: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gameweek: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    margin: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#3D619B',
  },
  topCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
  },
  pointsContainer: {
    // flexDirection: 'row-reverse',
    alignItems: 'center',
    // width: 90,
    height: 100,
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10
  },
  points: {
    fontSize: 14,
  }
});