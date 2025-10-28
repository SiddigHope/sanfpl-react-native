import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PlayerCard } from '../components/PlayerCard';
import { useFPLStore } from '../stores/fplStore';

type Position = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';

interface TransferRecommendation {
  sell: PlayerDisplay;
  buy: PlayerDisplay|any;
  reason: string;
}

interface PlayerDisplay {
  id: number;
  web_name: string;
  team_short_name: string;
  position: string;
  now_cost: number;
  form: string;
  photo: string;
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
    bank,
    fetchGlobalData,
    fetchUserTeam,
  } = useFPLStore();

  const [selectedPosition, setSelectedPosition] = useState<Position>('ALL');
  const [recommendations, setRecommendations] = useState<TransferRecommendation[]>([]);

  // 🧩 Load user team when ID or GW changes
  useEffect(() => {
    if (teamId && currentGameweek) fetchUserTeam(currentGameweek);
  }, [teamId, currentGameweek]);

  // 🧮 Fixture difficulty calculator
  const calculateFixtureDifficulty = (teamId: number, nextFixtures = 5) => {
    if (!fixtures?.length) return 3;
    const upcoming = fixtures
      .filter((f: any) => (f.team_h === teamId || f.team_a === teamId) && !f.finished)
      .slice(0, nextFixtures);
    if (upcoming.length === 0) return 3;
    const total = upcoming.reduce((sum:any, f:any) => {
      const diff = teamId === f.team_h ? f.team_h_difficulty : f.team_a_difficulty;
      return sum + diff;
    }, 0);
    return total / upcoming.length;
  };

  // 🧩 Enrich players with extra info
  const enrichedPlayers = useMemo(() => {
    if (!players?.length || !teams?.length) return [];
    return players.map(p => {
      const team = teams.find(t => t.id === p.team);
      const team_short_name = team?.short_name || '';
      const position = ['GK', 'DEF', 'MID', 'FWD'][p.element_type - 1];
      const fixture_difficulty = calculateFixtureDifficulty(p.team);
      const photo = p.code
      const code = p.code
      return { ...p, team_short_name, position, fixture_difficulty, photo, code };
    });
  }, [players, teams, fixtures]);

  // 🧠 Transfer Reason Generator
  const getTransferReason = (sell: any, buy: any) => {
    const reasons: string[] = [];
    if (parseFloat(sell.form) < 2.0) reasons.push('poor form');
    if (sell.chance_of_playing_next_round !== null && sell.chance_of_playing_next_round < 75)
      reasons.push('injury risk');
    if (sell.fixture_difficulty >= 4) reasons.push('tough fixtures');
    return `Replace ${sell.web_name} due to ${reasons.join(', ')}. ${buy.web_name} has better form (${buy.form}) and easier fixtures.`;
  };

  // 🧩 Personalized recommendations (rule-based)
  const getRecommendations = (): TransferRecommendation[] => {
    if (!userTeam?.picks?.length) return [];

    const userPicks = userTeam.picks
      .map((pick:any) => enrichedPlayers.find(p => p.id === pick.element))
      .filter(Boolean);

    const userPlayers = selectedPosition === "ALL" ? userPicks :
      userPicks.filter((p: any) => p.position === selectedPosition)

    const userPlayersIds = userPlayers
      .map((p: any) => p.id)

    // Define thresholds per position
    const thresholds:any = {
      1: { poorForm: 3.0, hardFixture: 4, injuryChance: 75 }, // GK
      2: { poorForm: 3.5, hardFixture: 4, injuryChance: 75 }, // DEF
      3: { poorForm: 4.0, hardFixture: 3.5, injuryChance: 75 }, // MID
      4: { poorForm: 4.5, hardFixture: 3.5, injuryChance: 75 }, // FWD
    };

    // const underperformers = userPlayers.filter(p => {
    //   const poorForm = parseFloat(p.form) < 3.5; // return t0 2.0
    //   const injury = p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 75;
    //   const hardFixtures = p.fixture_difficulty >= 3.5; // return to 4
    //   return poorForm || injury || hardFixtures;
    // });

    const underperformers = userPlayers.filter((p: any) => {
      const { poorForm, hardFixture, injuryChance } = thresholds[p.element_type] || thresholds[3];
      const form = parseFloat(p.form);
      const isPoorForm = form < poorForm;
      const isInjured = p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < injuryChance;
      const hasHardFixtures = p.fixture_difficulty && p.fixture_difficulty >= hardFixture;

      return isPoorForm || isInjured || hasHardFixtures;
    });

    const recs: TransferRecommendation[] = [];
    underperformers.forEach((player: any) => {
      const bestAlternative = enrichedPlayers
        .filter(
          p =>
            p.position === player.position &&
            p.id !== player.id && !userPlayersIds.includes(p.id) &&
            // parseFloat(p.form) > 5.0 &&
            parseFloat(p.form) > thresholds[p.element_type].poorForm + 1.5 && // must be clearly better
            p.fixture_difficulty < 3 &&
            p.now_cost <= (bank + player.now_cost)
        )
        .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))[0];

      if (bestAlternative) {
        recs.push({
          sell: player,
          buy: bestAlternative,
          reason: getTransferReason(player, bestAlternative),
        });
      }
    });

    return recs.slice(0, 5);
  };

  // 🌍 Global recommendations for users without a team ID
  const getGlobalRecommendations = (): any[] => {
    const filtered = selectedPosition === 'ALL'
      ? enrichedPlayers
      : enrichedPlayers.filter(p => p.position === selectedPosition);
    return filtered
      .sort((a, b) => parseFloat(b.value_form) - parseFloat(a.value_form))
      .slice(0, 5);
  };

  // 🌀 Update recommendations whenever data changes
  useEffect(() => {
    if (players.length && teams.length && fixtures?.length) {
      setRecommendations(teamId ? getRecommendations() : []);
    }
  }, [players, teams, fixtures, teamId, userTeam, selectedPosition]);

  // 🔄 Pull to refresh
  const handleRefresh = async () => {
    await fetchGlobalData();
    if (teamId && currentGameweek) await fetchUserTeam(currentGameweek);
  };

  // 🧱 UI Rendering
  const positions: Position[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{t('transfers')}</ThemedText>
      </ThemedView>

      <View style={styles.filterContainer}>
        {positions.map(pos => (
          <TouchableOpacity
            key={pos}
            onPress={() => setSelectedPosition(pos)}
            style={[styles.filterButton, pos === selectedPosition && styles.filterButtonActive]}
          >
            <ThemedText
              style={[styles.filterText, pos === selectedPosition && styles.filterTextActive]}
            >
              {pos}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {!teamId ? (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.noIdMessage}>
            {t('Add your FPL Team ID to get personalized transfer recommendations')}
          </ThemedText>
          <ThemedText style={styles.sectionTitle}>{t('Popular Transfers (Global)')}</ThemedText>
          {getGlobalRecommendations().map(p => (
            <PlayerCard
              key={p.id}
              name={p.web_name}
              player_image={true}
              player={p}
              opta_code={p.opta_code}
              team={p.team_short_name}
              position={p.position}
              price={p.now_cost}
              points={p.total_points}
              form={p.form}
            />
          ))}
        </ThemedView>
      ) : (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('Recommended Transfers')}</ThemedText>
          {recommendations.length === 0 ? (
            <ThemedText style={styles.noIdMessage}>
              {t('No transfer recommendations at the moment.')}
            </ThemedText>
          ) : (
            recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationContainer}>
                <View style={styles.transferPair}>
                  <View style={styles.playerOut}>
                    <PlayerCard
                      name={rec.sell.web_name}
                      team={rec.sell.team_short_name}
                      position={rec.sell.position}
                      price={rec.sell.now_cost}
                      form={rec.sell.form}
                      player_image={true}
                      player={rec.sell}
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
                      player_image={true}
                      player={rec.buy}
                      statusColor="#44FF44"
                    />
                  </View>
                </View>
                <ThemedText style={styles.recommendationReason}>{rec.reason}</ThemedText>
              </View>
            ))
          )}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E9E9EB',
  },
  filterButtonActive: { backgroundColor: '#3D619B' },
  filterText: { fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  section: { padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  noIdMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationContainer: { marginBottom: 24 },
  transferPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerOut: { flex: 1 },
  playerIn: { flex: 1 },
  transferArrow: { fontSize: 24, marginHorizontal: 8 },
  recommendationReason: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});
