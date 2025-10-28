import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import EnterTeamIdTextInput from '../components/EnterTeamIdTextInput';
import { PlayerCard } from '../components/PlayerCard';
import { PlayerTransferCard } from '../components/PlayerTransferCard';
import { useFPLStore } from '../stores/fplStore';
import { calculateTeamRating, optimizeTeam, useEnrichedPlayers } from '../utils/fplCalculations';

export const TeamRatingScreen = () => {
  const navigation = useNavigation();

  const {
    players,
    teams,
    fixtures,
    currentGameweek,
    teamId,
    userTeam: userSquad,
    isLoading,
    error,
    bank,
    fetchUserTeam
  } = useFPLStore();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [futureGameweek, setFutureGameweek] = useState(1);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [userTeam, setUserTeam] = useState(userSquad || {});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [inBank, setInBank] = useState(0)

  useEffect(() => {
    if (teamId) {
      fetchUserTeam(currentGameweek);
      setInBank(bank)
    }
  }, [teamId, currentGameweek, fetchUserTeam]);

  const enrichedPlayers = useEnrichedPlayers(players, teams, fixtures, currentGameweek + futureGameweek);

  const teamPlayers = useMemo(() => {
    if (!userTeam?.picks) return [];

    return userTeam.picks.map(pick => {
      const player = enrichedPlayers.find(p => p.id === pick.element);

      // Find the fixture where this player's team is involved
      const fixture = fixtures.find(f =>
        f.event === currentGameweek + futureGameweek &&
        (f.team_h === player?.team || f.team_a === player?.team)
      );

      // Determine opponent team ID
      const opponentTeamId =
        fixture?.team_h === player?.team ? fixture?.team_a : fixture?.team_h;

      // Get opponent team short name
      const opponentTeam = teams.find(t => t.id === opponentTeamId);
      const opponentShortName = opponentTeam?.short_name || '—';

      return {
        ...player,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
        multiplier: pick.multiplier,
        opponent_short_name: opponentShortName, // 👈 added field
      };
    });
  }, [userTeam, enrichedPlayers, fixtures, teams, currentGameweek, futureGameweek]);

  useEffect(() => {
    if (teamPlayers.length > 0) {
      setCurrentTeam({
        starting: teamPlayers.slice(0, 11),
        bench: teamPlayers.slice(11),
      });
    }
  }, [teamPlayers]);

  const { starting, bench } = currentTeam || { starting: [], bench: [] };

  const teamRating = useMemo(() => {
    return calculateTeamRating(starting);
  }, [starting]);

  const totalPredictedPoints = useMemo(() => {
    return starting.reduce((sum, player) => {
      const points = player.predicted_points;
      return sum + (player.is_captain ? points * 2 : points);
    }, 0);
  }, [starting]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const { starting: optimizedStarting, bench: optimizedBench, captain, viceCaptain } = optimizeTeam([
      ...starting,
      ...bench
    ]);

    setCurrentTeam({
      starting: optimizedStarting,
      bench: optimizedBench
    });

    setIsOptimizing(false);
    Alert.alert('Team Optimized',
      `New Captain: ${captain.web_name}\n` +
      `Vice Captain: ${viceCaptain.web_name}\n` +
      `Predicted Points: ${totalPredictedPoints.toFixed(1)}`
    );
  };

  const handleReset = () => {
    setCurrentTeam({
      starting: teamPlayers.slice(0, 11),
      bench: teamPlayers.slice(11),
    });
  };

  const handleSave = () => {
    // TODO: Implement save to store
    Alert.alert('Success', 'Team saved successfully');
  };

  const makeSubstitution = (startingPlayerId, benchPlayerId) => {
    setCurrentTeam(prevTeam => {
      const starting = [...prevTeam.starting];
      const bench = [...prevTeam.bench];

      // Find indexes
      const startingIndex = starting.findIndex(p => p.id === startingPlayerId);
      const benchIndex = bench.findIndex(p => p.id === benchPlayerId);

      if (startingIndex === -1 || benchIndex === -1) return prevTeam; // safety

      // Swap players
      const temp = starting[startingIndex];
      starting[startingIndex] = bench[benchIndex];
      bench[benchIndex] = temp;

      return { starting, bench };
    });

    setSelectedPlayer(null)
  };

  const handlePlayerPress = (player) => {
    if (selectedPlayer?.action === 'substitute' && player.multiplier !== selectedPlayer?.multiplier) {
      const startingPlayer = player.multiplier > 0 ? player : selectedPlayer
      const benchedPlayer = player.multiplier === 0 ? player : selectedPlayer
      makeSubstitution(startingPlayer.id, benchedPlayer.id)
      return
    }
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleSubstitute = (player) => {
    setShowModal(false);
    Alert.alert(
      'Select Player to Substitute',
      'Tap the player you want to swap with',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            // Enable selection mode for substitution
            const tempPlayer = { ...player, action: 'substitute' }
            setSelectedPlayer(tempPlayer);
          }
        }
      ]
    );
  };

  const handleTransfer = (player) => {
    const tempPlayer = { ...player, action: 'transfer' }
    setShowModal(false);
    // setShowTransferModal(true);
    setSelectedPlayer(tempPlayer);
    navigation.navigate('TransferPlayerSelection', { selectedPlayer: tempPlayer, currentTeam, inBank, makeTransfer })
  };

  const makeTransfer = (inPlayer: any) => {
    const outPlayer = selectedPlayer
    const combinedPlayer = { ...selectedPlayer, ...inPlayer }
    // Example: FPL API gives prices multiplied by 10
    const outPrice = outPlayer?.now_cost / 10; // e.g. 75 => £7.5m
    const inPrice = inPlayer.now_cost / 10;
    const currentBank = inBank / 10;

    const availableFunds = currentBank + outPrice;

    // ✅ Update the bank
    const newBank = availableFunds - inPrice;

    // ✅ Replace the player in the team

    const updatedPicks = userTeam.picks.map(pick =>
      pick.element === outPlayer?.id
        ? { ...pick, element: inPlayer.id }
        : pick
    );

    // ✅ Update the user team in your store
    setUserTeam({
      ...userTeam,
      picks: updatedPicks,
    });
    setInBank(newBank * 10) // convert back to FPL API scale
  }

  const handleSetCaptain = (player) => {
    const updatedTeam = {
      starting: starting.map(p => ({
        ...p,
        is_captain: p.id === player.id,
        is_vice_captain: p.is_vice_captain && p.id !== player.id
      })),
      bench: bench.map(p => ({
        ...p,
        is_captain: p.id === player.id,
        is_vice_captain: p.is_vice_captain && p.id !== player.id
      }))
    };
    setCurrentTeam(updatedTeam);
    setShowModal(false);
  };

  const handleSetViceCaptain = (player) => {
    const updatedTeam = {
      starting: starting.map(p => ({
        ...p,
        is_vice_captain: p.id === player.id,
        is_captain: p.is_captain && p.id !== player.id
      })),
      bench: bench.map(p => ({
        ...p,
        is_vice_captain: p.id === player.id,
        is_captain: p.is_captain && p.id !== player.id
      }))
    };
    setCurrentTeam(updatedTeam);
    setShowModal(false);
  };

  const renderPlayer = (player, index) => (
    <PlayerCard
      key={player.id}
      player={player}
      points={player.predicted_points}
      shirt={true}
      type={""}
      opta_code={player.opta_code}
      name={player.web_name}
      team={player.team_short_name}
      position={player.position}
      price={player.now_cost}
      form={player.form}
      opponent_short_name={player.opponent_short_name}
      onPress={() => handlePlayerPress(player)}
      selected={selectedPlayer === player.id}
      isCaptain={player.is_captain}
      isViceCaptain={player.is_vice_captain}
    />
  );

  const renderPlayerModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setShowModal(false);
              navigation.navigate('PlayerInfo', { playerId: selectedPlayer?.id });
            }}
          >
            <ThemedText style={styles.modalOptionText}>Player Info</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleSubstitute(selectedPlayer)}
          >
            <ThemedText style={styles.modalOptionText}>Substitute</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleTransfer(selectedPlayer)}
          >
            <ThemedText style={styles.modalOptionText}>Transfer</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleSetCaptain(selectedPlayer)}
          >
            <ThemedText style={styles.modalOptionText}>Set Captain</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleSetViceCaptain(selectedPlayer)}
          >
            <ThemedText style={styles.modalOptionText}>Set Vice Captain</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalOption, styles.modalOptionCancel]}
            onPress={() => setShowModal(false)}
          >
            <ThemedText style={styles.modalOptionText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTransferModal = () => {
    const availablePlayers = players
      .filter(p => {
        const isInTeam = [...starting, ...bench].some(tp => tp.id === p.id);
        const matchesPosition = p.element_type === selectedPlayer?.element_type;
        const matchesSearch = p.web_name.toLowerCase().includes(searchQuery.toLowerCase());
        return !isInTeam && matchesPosition && matchesSearch;
      })
    // .sort((a, b) => b.total_points - a.total_points);

    return (
      <Modal
        visible={showTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={availablePlayers}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <PlayerTransferCard
                  key={item.id}
                  name={item.web_name}
                  player={item}
                  form={item.form}
                  points={item.total_points}
                  team={item.team_short_name}
                  position={item.element_type}
                  price={item.now_cost}
                  showPhoto={true}
                />
              )}
            />
            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionCancel]}
              onPress={() => {
                setShowTransferModal(false);
                setSearchQuery('');
              }}
            >
              <ThemedText style={styles.modalOptionText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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

  if (!teamId) {
    return (
      <EnterTeamIdTextInput />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.ratingContainer}>
          <ThemedText style={styles.ratingLabel}>Team Rating</ThemedText>
          <ThemedText style={styles.ratingValue}>{teamRating}%</ThemedText>
        </View>

        <View style={styles.gameweekSelector}>
          <TouchableOpacity
            onPress={() => setFutureGameweek(Math.max(0, futureGameweek - 1))}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.gameweekText}>
            GW{currentGameweek + futureGameweek}
          </ThemedText>
          <TouchableOpacity
            onPress={() => setFutureGameweek(futureGameweek + 1)}
          >
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsLabel}>Predicted</ThemedText>
          <ThemedText style={styles.pointsValue}>
            {totalPredictedPoints.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <ThemedText style={styles.buttonText}>Reset</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.optimizeButton]}
          onPress={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.buttonText}>Optimize</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <ThemedText style={styles.buttonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.pitchContainer}>

        <View style={styles.pitchHeader}>
          <View style={styles.ratingContainer}>
          </View>

          <View style={styles.pointsContainer}>
            <ThemedText style={styles.pointsLabel}>Bank</ThemedText>
            <Text style={[styles.pointsValue, { fontSize: 16 }]}>
              {(inBank / 10).toFixed(1)}
            </Text>
          </View>
        </View>

        {[1, 2, 3, 4].map((position: any) => (
          <View key={position} style={styles.startingGrid}>
            {starting.map((player, index) =>
              position === player.element_type && (
                <View key={player.id} style={styles.gridItem}>
                  {renderPlayer(player, index)}
                </View>
              )
            )}
          </View>
        ))}
      </View>

      <View style={styles.benchContainer}>
        {/* <ThemedText style={styles.benchLabel}>Bench</ThemedText> */}
        <View style={styles.benchRow}>
          {bench.map(renderPlayer)}
        </View>
      </View>

      {renderPlayerModal()}
      {/* {renderTransferModal()} */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pitchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    top: 20,
    paddingHorizontal: 20
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameweekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  gameweekText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  optimizeButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pitchContainer: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
  },
  startingGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'space-around',
  },
  gridItem: {
    width: '25%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  playerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCard: {
    width: '100%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  captainCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  captainBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viceCaptainBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captainText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  benchContainer: {
    marginTop: 20,
  },
  benchLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  benchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionCancel: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  noTeamText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#FF3B30',
  },
});