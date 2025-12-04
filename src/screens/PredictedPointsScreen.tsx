import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
// import { ThemedText, ThemedView } from '@/components/Themed';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFPLStore } from '../stores/fplStore';
import { useEnrichedPlayers } from '../utils/fplCalculations';
import useNav from '../utils/navigationHelper';

const INITIAL_DISPLAY_COUNT = 10;
const POSITIONS = ['All', 'GK', 'DEF', 'MID', 'FWD'];

export const PredictedPointsScreen = () => {
  const navigation = useNavigation();

  const {navigate} = useNav()
  const [selectedPosition, setSelectedPosition] = useState('All');
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

  const filteredPlayers = useMemo(() => {
    let filtered = enrichedPlayers
      .filter(player => player.minutes > 0) // Only show players who have played
      .sort((a, b) => b.predicted_points - a.predicted_points);

    if (selectedPosition !== 'All') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    return filtered;
  }, [enrichedPlayers, selectedPosition]);

  const displayedPlayers = showAll 
    ? filteredPlayers 
    : filteredPlayers.slice(0, INITIAL_DISPLAY_COUNT);

  const renderPositionTab = (position) => (
    <TouchableOpacity
      key={position}
      style={[
        styles.tab,
        position === selectedPosition && styles.selectedTab
      ]}
      onPress={() => {
        setSelectedPosition(position);
        setShowAll(false);
      }}
    >
      <ThemedText 
        style={[
          styles.tabText,
          position === selectedPosition && styles.selectedTabText
        ]}
      >
        {position}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigate('PlayerInfo', { playerId: item.id })}
    >
      <ThemedView style={styles.playerCard}>
        <View style={styles.playerHeader}>
          <ThemedText style={styles.playerName}>
            {item.web_name} ({item.team_short_name})
          </ThemedText>
          <ThemedText style={styles.position}>{item.position}</ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Predicted</ThemedText>
            <ThemedText style={styles.statValue}>
              {item.predicted_points.toFixed(1)}
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Form</ThemedText>
            <ThemedText style={styles.statValue}>{item.form}</ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Fixture</ThemedText>
            <ThemedText style={styles.statValue}>
              {item.fixture_difficulty}/5
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        {POSITIONS.map(renderPositionTab)}
      </ScrollView>

      <FlatList
        data={displayedPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <ThemedText style={styles.resultsCount}>
            Showing {displayedPlayers.length} of {filteredPlayers.length} players
          </ThemedText>
        }
        ListFooterComponent={
          !showAll && filteredPlayers.length > INITIAL_DISPLAY_COUNT ? (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setShowAll(true)}
            >
              <ThemedText style={styles.seeMoreText}>
                See More ({filteredPlayers.length - INITIAL_DISPLAY_COUNT} more)
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexGrow: 0,
    padding: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  playerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  position: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
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