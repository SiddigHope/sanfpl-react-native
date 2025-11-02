import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import PlayerImage from '../components/PlayerImage';
import { useFPLStore } from '../stores/fplStore';
import { useEnrichedPlayers } from '../utils/fplCalculations';

type RouteParams = {
  playerId: number;
};

export const PlayerInfoScreen = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { playerId } = route.params;

  const {
    players,
    teams,
    fixtures,
    currentGameweek,
    isLoading,
    error
  } = useFPLStore();

  const enrichedPlayers = useEnrichedPlayers(players, teams, fixtures, currentGameweek);
  
  const playerInfo = useMemo(() => {
    return enrichedPlayers.find(p => p.id === playerId);
  }, [enrichedPlayers, playerId]);

  const team = useMemo(() => {
    return teams.find(t => t.id === playerInfo?.team);
  }, [teams, playerInfo]);

  const nextFixtures = useMemo(() => {
    if (!playerInfo) return [];
    return fixtures
      .filter(f => 
        (f.team_h === playerInfo.team || f.team_a === playerInfo.team) &&
        f.event >= currentGameweek
      )
      .slice(0, 5)
      .map(f => {
        const isHome = f.team_h === playerInfo.team;
        const opponent = teams.find(t => t.id === (isHome ? f.team_a : f.team_h));
        return {
          event: f.event,
          opponent: opponent?.short_name || '',
          isHome,
          difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty
        };
      });
  }, [fixtures, playerInfo, teams, currentGameweek]);

  // 🧮 Approximate xG, xGA, xGI based on ICT values
  const derivedStats = useMemo(() => {
    if (!playerInfo) return { xg: 0, xga: 0, xgi: 0 };
    const xg = Number(playerInfo.threat) / 200;
    const xga = Number(playerInfo.creativity) / 200;
    const xgi = xg + xga;
    return {
      xg: xg.toFixed(2),
      xga: xga.toFixed(2),
      xgi: xgi.toFixed(2),
    };
  }, [playerInfo]);

  const renderStatItem = (label: string, value: string | number) => (
    <View style={styles.statItem}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );

  const renderFixture = (fixture: any, index: number) => (
    <View key={index} style={styles.fixtureItem}>
      <ThemedText style={styles.fixtureEvent}>GW{fixture.event}</ThemedText>
      <ThemedText style={styles.fixtureOpponent}>
        {fixture.isHome ? 'vs' : '@'} {fixture.opponent}
      </ThemedText>
      <View 
        style={[
          styles.difficultyIndicator,
          { backgroundColor: getDifficultyColor(fixture.difficulty) }
        ]}
      >
        <ThemedText style={styles.difficultyText}>{fixture.difficulty}</ThemedText>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !playerInfo) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          {error || 'Player not found'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <PlayerImage {...styles.playerImage} image={playerInfo?.code} />
        <View style={styles.headerInfo}>
          <ThemedText style={styles.playerName}>{playerInfo.web_name}</ThemedText>
          <ThemedText style={styles.teamName}>{team?.name}</ThemedText>
          <ThemedText style={styles.position}>{playerInfo.position}</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Key Stats</ThemedText>
        <View style={styles.statsGrid}>
          {renderStatItem('Price', `£${(playerInfo.now_cost / 10).toFixed(1)}m`)}
          {renderStatItem('Form', playerInfo.form)}
          {renderStatItem('Total Points', playerInfo.total_points)}
          {renderStatItem('Selected by', `${playerInfo.selected_by_percent}%`)}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Predictions</ThemedText>
        <View style={styles.statsGrid}>
          {renderStatItem('Predicted Points', playerInfo.predicted_points.toFixed(1))}
          {renderStatItem('Captain Score', playerInfo.captain_score.toFixed(2))}
          {renderStatItem('Chance of Playing', `${playerInfo.chance_of_playing_next_round ?? 100}%`)}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Performance</ThemedText>
        <View style={styles.statsGrid}>
          {renderStatItem('Minutes', playerInfo.minutes)}
          {renderStatItem('Goals', playerInfo.goals_scored)}
          {renderStatItem('Assists', playerInfo.assists)}
          {renderStatItem('Clean Sheets', playerInfo.clean_sheets)}
          {renderStatItem('Bonus', playerInfo.bonus)}
          {renderStatItem('BPS', playerInfo.bps)}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Advanced Stats</ThemedText>
        <View style={styles.statsGrid}>
          {renderStatItem('ICT Index', playerInfo.ict_index)}
          {renderStatItem('xG (est)', derivedStats.xg)}
          {renderStatItem('xGA (est)', derivedStats.xga)}
          {renderStatItem('xGI (est)', derivedStats.xgi)}
          {renderStatItem('Influence', playerInfo.influence)}
          {renderStatItem('Creativity', playerInfo.creativity)}
          {renderStatItem('Threat', playerInfo.threat)}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Next 5 Fixtures</ThemedText>
        <View style={styles.fixturesList}>
          {nextFixtures.map(renderFixture)}
        </View>
      </ThemedView>
    </ScrollView>
  );
};


const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1: return '#00FF87'; // Very Easy
    case 2: return '#7CBA00'; // Easy
    case 3: return '#FFC000'; // Medium
    case 4: return '#FF7F00'; // Hard
    case 5: return '#FF3B30'; // Very Hard
    default: return '#808080'; // Unknown
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  playerImage: {
    width: 110,
    height: 140,
    borderRadius: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 16,
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  fixturesList: {
    marginTop: 8,
  },
  fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fixtureEvent: {
    width: 50,
    fontSize: 14,
  },
  fixtureOpponent: {
    flex: 1,
    fontSize: 14,
  },
  difficultyIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#FF3B30',
  },
});