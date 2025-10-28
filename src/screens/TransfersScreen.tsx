import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PlayerCard } from '../components/PlayerCard';
import { useFPLStore } from '../stores/fplStore';

type Position = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';

interface TransferRecommendation {
  sell: {
    id: number;
    web_name: string;
    team_short_name: string;
    position: string;
    now_cost: number;
    form: string;
    photo: string;
  };
  buy: {
    id: number;
    web_name: string;
    team_short_name: string;
    position: string;
    now_cost: number;
    form: string;
    photo: string;
  };
  reason: string;
}

export default function TransfersScreen() {
  const { t } = useTranslation();
  const { 
    players, 
    teams, 
    fixtures, 
    userTeam, 
    teamId,
    currentGameweek,
    isLoading, 
    fetchGlobalData,
    fetchUserTeam 
  } = useFPLStore();
  const [selectedPosition, setSelectedPosition] = useState<Position>('ALL');
  const [recommendations, setRecommendations] = useState<TransferRecommendation[]>([]);

  useEffect(() => {
    if (teamId && currentGameweek) {
      fetchUserTeam(currentGameweek);
    }
  }, [teamId, currentGameweek]);

  const calculateFixtureDifficulty = (teamId: number, nextFixtures = 5) => {
    const teamFixtures = fixtures
      ?.filter((f: any) => f.team_h === teamId || f.team_a === teamId)
      ?.slice(0, nextFixtures) || [];

    if (teamFixtures.length === 0) return 3; // Default difficulty

    const avgDifficulty = teamFixtures.reduce((sum:any, fixture: any) => {
      const difficulty = teamId === fixture.team_h ? fixture.team_h_difficulty : fixture.team_a_difficulty;
      return sum + difficulty;
    }, 0) / teamFixtures.length;

    return avgDifficulty;
  };

  const getRecommendations = () => {
    if (!userTeam || !teamId) return [];

    const enrichedPlayers = players.map(player => ({
      ...player,
      team_short_name: teams.find(t => t.id === player.team)?.short_name || '',
      position: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
      fixture_difficulty: calculateFixtureDifficulty(player.team),
      photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo}`
    }));

    const userPlayers = userTeam.picks.map((pick: any) => {
      const player = enrichedPlayers.find(p => p.id === pick.element);
      return player;
    }).filter(Boolean);

    const underperformers = userPlayers.filter((player: any) => {
      const isUnderperforming = parseFloat(player.form) < 2.0;
      const isInjuryRisk = player.chance_of_playing_next_round !== null && 
                          player.chance_of_playing_next_round < 75;
      const hasDifficultFixtures = player.fixture_difficulty >= 4;

      return isUnderperforming || isInjuryRisk || hasDifficultFixtures;
    });

    const recommendations: TransferRecommendation[] = [];

    underperformers.forEach((player: any) => {
      const alternatives = enrichedPlayers.filter(p => 
        p.position === player.position &&
        p.id !== player.id &&
        parseFloat(p.form) > 5.0 &&
        p.fixture_difficulty < 3 &&
        p.now_cost <= (userTeam.bank + player.now_cost)
      ).sort((a, b) => parseFloat(b.form) - parseFloat(a.form));

      if (alternatives.length > 0) {
        const bestAlternative = alternatives[0];
        recommendations.push({
          sell: {
            id: player.id,
            web_name: player.web_name,
            team_short_name: player.team_short_name,
            position: player.position,
            now_cost: player.now_cost,
            form: player.form,
            photo: player.photo
          },
          buy: {
            id: bestAlternative.id,
            web_name: bestAlternative.web_name,
            team_short_name: bestAlternative.team_short_name,
            position: bestAlternative.position,
            now_cost: bestAlternative.now_cost,
            form: bestAlternative.form,
            photo: bestAlternative.photo
          },
          reason: getTransferReason(player, bestAlternative)
        });
      }
    });

    return recommendations.slice(0, 5);
  };

  const getTransferReason = (sellPlayer: any, buyPlayer: any) => {
    const reasons = [];
    if (parseFloat(sellPlayer.form) < 2.0) {
      reasons.push('poor form');
    }
    if (sellPlayer.chance_of_playing_next_round !== null && 
        sellPlayer.chance_of_playing_next_round < 75) {
      reasons.push('injury risk');
    }
    if (sellPlayer.fixture_difficulty >= 4) {
      reasons.push('difficult fixtures');
    }

    return `Replace due to ${reasons.join(', ')}. ${buyPlayer.web_name} has better form (${buyPlayer.form}) and easier fixtures.`;
  };

  const getGlobalRecommendations = () => {
    const enrichedPlayers = players.map(player => ({
      ...player,
      team_short_name: teams.find(t => t.id === player.team)?.short_name || '',
      position: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
      photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo}`,
      value_form: parseFloat(player.value_form)
    }));

    const filteredPlayers = selectedPosition === 'ALL'
      ? enrichedPlayers
      : enrichedPlayers.filter(p => p.position === selectedPosition);

    return filteredPlayers
      .sort((a, b) => b.value_form - a.value_form)
      .slice(0, 5);
  };

  useEffect(() => {
    if (players.length > 0 && teams.length > 0 && fixtures?.length > 0) {
      const recs = teamId ? getRecommendations() : [];
      setRecommendations(recs);
    }
  }, [players, teams, fixtures, teamId, userTeam, selectedPosition]);

  const positions: Position[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  const handleRefresh = async () => {
    await fetchGlobalData();
    if (teamId && currentGameweek) {
      await fetchUserTeam(currentGameweek);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{t('transfers')}</ThemedText>
      </ThemedView>

      <View style={styles.filterContainer}>
        {positions.map((position) => (
          <TouchableOpacity
            key={position}
            onPress={() => setSelectedPosition(position)}
            style={[
              styles.filterButton,
              position === selectedPosition && styles.filterButtonActive
            ]}
          >
            <ThemedText
              style={[
                styles.filterText,
                position === selectedPosition && styles.filterTextActive
              ]}
            >
              {position}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {!teamId ? (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.noIdMessage}>
            Add your FPL Team ID to get personal transfer recommendations
          </ThemedText>
          <ThemedText style={styles.sectionTitle}>Popular Transfers (Global)</ThemedText>
          {getGlobalRecommendations().map((player) => (
            <PlayerCard
              key={player.id}
              name={player.web_name}
              team={player.team_short_name}
              position={player.position}
              price={player.now_cost}
              points={player.total_points}
              form={player.form}
            />
          ))}
        </ThemedView>
      ) : (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recommended Transfers</ThemedText>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationContainer}>
              <View style={styles.transferPair}>
                <View style={styles.playerOut}>
                  <PlayerCard
                    name={rec.sell.web_name}
                    team={rec.sell.team_short_name}
                    position={rec.sell.position}
                    price={rec.sell.now_cost}
                    form={rec.sell.form}
                    statusColor="#FF4444"
                  />
                </View>
                <ThemedText style={styles.transferArrow}>→</ThemedText>
                <View style={styles.playerIn}>
                  <PlayerCard
                    name={rec.buy.web_name}
                    team={rec.buy.team_short_name}
                    position={rec.buy.position}
                    price={rec.buy.now_cost}
                    form={rec.buy.form}
                    statusColor="#44FF44"
                  />
                </View>
              </View>
              <ThemedText style={styles.recommendationReason}>{rec.reason}</ThemedText>
            </View>
          ))}
        </ThemedView>
      )}
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
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E9E9EB',
  },
  filterButtonActive: {
    backgroundColor: '#3D619B',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noIdMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationContainer: {
    marginBottom: 24,
  },
  transferPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerOut: {
    flex: 1,
  },
  playerIn: {
    flex: 1,
  },
  transferArrow: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  recommendationReason: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});