import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import EnterTeamIdTextInput from '../components/EnterTeamIdTextInput';
import { useFPLStore } from '../stores/fplStore';
import { calculateTeamRating, optimizeTeam, useEnrichedPlayers } from '../utils/fplCalculations';

const FORMATIONS = ['3-4-3', '3-5-2', '4-4-2', '4-3-3', '4-5-1', '5-4-1', '5-3-2'];

export const TeamRatingScreenOLD = () => {
  const navigation = useNavigation();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFormation, setCurrentFormation] = useState('3-4-3');
  const [futureGameweek, setFutureGameweek] = useState(0); // 0 means next gameweek

  const {
    players,
    teams,
    fixtures,
    currentGameweek,
    teamId,
    userTeam,
    isLoading,
    error,
    fetchUserTeam
  } = useFPLStore();

  useEffect(() => {
    if (teamId) {
      fetchUserTeam(currentGameweek);
    }
  }, [teamId, currentGameweek]);

  const enrichedPlayers = useEnrichedPlayers(players, teams, fixtures, currentGameweek + futureGameweek);

  const teamPlayers = useMemo(() => {
    if (!userTeam?.picks) return [];
    return userTeam.picks.map(pick => {
      const player = enrichedPlayers.find(p => p.id === pick.element);
      return {
        ...player,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
        multiplier: pick.multiplier,
      };
    });
  }, [userTeam, enrichedPlayers]);

  const { starting, bench, captain, viceCaptain } = useMemo(() => {
    if (teamPlayers.length === 0) return { starting: [], bench: [], captain: null, viceCaptain: null };
    return optimizeTeam(teamPlayers, currentFormation);
  }, [teamPlayers, currentFormation]);

  const teamRating = useMemo(() => {
    return calculateTeamRating(starting);
  }, [starting]);

  const totalPredictedPoints = useMemo(() => {
    return starting.reduce((sum, player) => {
      const points = player.predicted_points;
      return sum + (player.is_captain ? points * 2 : points);
    }, 0);
  }, [starting]);

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleOptimize = () => {
    const { starting: optimizedStarting, captain: newCaptain, viceCaptain: newVice } = optimizeTeam(teamPlayers, currentFormation);

    // Update the team with optimized lineup
    // This would need to be implemented in the store
    Alert.alert('Team Optimized',
      `New Captain: ${newCaptain.web_name}\n` +
      `Vice Captain: ${newVice.web_name}\n` +
      `Predicted Points: ${totalPredictedPoints.toFixed(1)}`
    );
  };

  const renderPlayer = (player, index) => (
    <TouchableOpacity
      key={player.id}
      style={styles.playerContainer}
      onPress={() => handlePlayerPress(player)}
    >
      <View style={[styles.playerCard, player.is_captain && styles.captainCard]}>
        <ThemedText style={styles.playerName}>{player.web_name}</ThemedText>
        <ThemedText style={styles.playerPoints}>
          {player.predicted_points.toFixed(1)}
        </ThemedText>
        {player.is_captain && (
          <View style={styles.captainBadge}>
            <ThemedText style={styles.captainText}>C</ThemedText>
          </View>
        )}
        {player.is_vice_captain && (
          <View style={styles.viceCaptainBadge}>
            <ThemedText style={styles.captainText}>V</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
            onPress={() => {
              setShowModal(false);
              navigation.navigate('Transfers');
            }}
          >
            <ThemedText style={styles.modalOptionText}>Transfer</ThemedText>
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

        <TouchableOpacity
          style={styles.gameweekSelector}
          onPress={() => setFutureGameweek(futureGameweek === 0 ? 1 : 0)}
        >
          <ThemedText style={styles.gameweekText}>
            GW{currentGameweek + futureGameweek + 1}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsLabel}>Predicted</ThemedText>
          <ThemedText style={styles.pointsValue}>
            {totalPredictedPoints.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.formationContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.formationScroll}
        >
          {FORMATIONS.map(formation => (
            <TouchableOpacity
              key={formation}
              style={[
                styles.formationButton,
                formation === currentFormation && styles.selectedFormation
              ]}
              onPress={() => setCurrentFormation(formation)}
            >
              <ThemedText
                style={[
                  styles.formationText,
                  formation === currentFormation && styles.selectedFormationText
                ]}
              >
                {formation}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pitchContainer}>
        {/* Render players in formation */}
        <View style={styles.gkRow}>
          {starting.filter(p => p.position === 'GK').map(renderPlayer)}
        </View>
        <View style={styles.defRow}>
          {starting.filter(p => p.position === 'DEF').map(renderPlayer)}
        </View>
        <View style={styles.midRow}>
          {starting.filter(p => p.position === 'MID').map(renderPlayer)}
        </View>
        <View style={styles.fwdRow}>
          {starting.filter(p => p.position === 'FWD').map(renderPlayer)}
        </View>
      </View>

      <View style={styles.benchContainer}>
        <ThemedText style={styles.benchLabel}>Bench</ThemedText>
        <View style={styles.benchRow}>
          {bench.map(renderPlayer)}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.optimizeButton]}
          onPress={handleOptimize}
        >
          <ThemedText style={styles.buttonText}>Optimize Team</ThemedText>
        </TouchableOpacity>
      </View>

      {renderPlayerModal()}
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
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  gameweekText: {
    fontSize: 16,
    fontWeight: '600',
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
  formationContainer: {
    marginBottom: 20,
  },
  formationScroll: {
    flexGrow: 0,
  },
  formationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedFormation: {
    backgroundColor: '#007AFF',
  },
  formationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFormationText: {
    color: '#FFFFFF',
  },
  pitchContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  gkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  defRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  midRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  fwdRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  playerContainer: {
    alignItems: 'center',
  },
  playerCard: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 80,
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
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  optimizeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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