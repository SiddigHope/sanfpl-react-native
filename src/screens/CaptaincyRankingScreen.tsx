import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import PlayerImage from '../components/PlayerImage';
import { useFPLStore } from '../stores/fplStore';
import { useEnrichedPlayers } from '../utils/fplCalculations';

const INITIAL_DISPLAY_COUNT = 10;

export const CaptaincyRankingScreen = () => {
  const navigation = useNavigation();
  const [showAll, setShowAll] = useState(false);
  
  const {
    players,
    teams,
    fixtures,
    currentGameweek,
    isLoading,
    error
  } = useFPLStore();

  const enrichedPlayers = useEnrichedPlayers(players, teams, fixtures, currentGameweek);

  const rankedPlayers = useMemo(() => {
    return enrichedPlayers
      .sort((a, b) => b.captain_score - a.captain_score)
      .filter(player => player.minutes > 0); // Only show players who have played
  }, [enrichedPlayers]);

  const displayedPlayers = showAll ? rankedPlayers : rankedPlayers.slice(0, INITIAL_DISPLAY_COUNT);

  const renderPlayerItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PlayerInfo', { playerId: item.id })}
    >
      <ThemedView style={styles.playerCard}>
        {/* <ThemedText style={styles.rank}>{index + 1}</ThemedText> */}
        <PlayerImage image={item.code} height={100} width={70} />
        <View style={styles.playerInfo}>
          <ThemedText style={styles.playerName}>
            {item.web_name} ({item.team_short_name})
          </ThemedText>
          <ThemedText style={styles.fixtureText}>
            Next: {item.fixture_difficulty}/5 difficulty
          </ThemedText>
          <View style={styles.statsRow}>
            <ThemedText style={styles.statText}>
              Form: {item.form}
            </ThemedText>
            <ThemedText style={styles.statText}>
              Predicted: {item.predicted_points.toFixed(1)}
            </ThemedText>
          </View>
          <View style={styles.captainScoreContainer}>
            <ThemedText style={styles.captainScore}>
              Captain Score: {item.captain_score.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Captaincy Rankings</ThemedText>
      <ThemedText style={styles.subtitle}>
        Based on form, predicted points, fixture difficulty, and playing chance
      </ThemedText>
      
      <FlatList
        data={displayedPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          !showAll && rankedPlayers.length > INITIAL_DISPLAY_COUNT ? (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setShowAll(true)}
            >
              <ThemedText style={styles.seeMoreText}>
                See More ({rankedPlayers.length - INITIAL_DISPLAY_COUNT} more)
              </ThemedText>
            </TouchableOpacity>
          ) : null
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 5,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 16,
    alignSelf: 'center',
    minWidth: 40,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  fixtureText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
  },
  captainScoreContainer: {
    marginTop: 8,
    padding: 8,
    // backgroundColor: '#f0f0f0',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  captainScore: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  seeMoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});