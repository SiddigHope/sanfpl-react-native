import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PlayerCard } from './PlayerCard';

interface Player {
  id: number;
  web_name: string;
  team_short_name: string;
  position: string;
  now_cost: number;
  total_points: number;
  form: string;
  opta_code: string;
  isBenchGoalkeeper: boolean,
  isBenched: boolean,
  event_points: number
}

interface TeamPitchProps {
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  onPlayerPress?: (player: Player) => void;
  selectedPlayer?: number;
  showBench?: boolean;
  bench: Player[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PITCH_PADDING = 16;
const PITCH_WIDTH = SCREEN_WIDTH - (PITCH_PADDING * 2);
const PITCH_HEIGHT = PITCH_WIDTH * 1.25;

export const TeamPitch: React.FC<TeamPitchProps> = ({
  goalkeepers,
  defenders,
  midfielders,
  forwards,
  onPlayerPress,
  selectedPlayer,
  showBench = false,
  bench,
}) => {
  const renderPlayers = (players: Player[], rowPosition: number) => {
    const spacing = PITCH_WIDTH / (players.length + 1);

    return (
      <View
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
          // left: spacing * (index + 1) - 40,
          // top: (PITCH_HEIGHT * rowPosition) - 40,
        },
        rowPosition === 0.8 && {marginBottom: 10}
      ]}
      >
        {players?.map((player, index) => (
          <PlayerCard
            key={player.id}
            shirt={true}
            type='points'
            isBenchGoalkeeper={player.isBenchGoalkeeper}
            isBenched={player.isBenched}
            opta_code={player.opta_code}
            name={player.web_name}
            team={player.team_short_name}
            position={player.position}
            price={player.now_cost}
            points={player.event_points}
            form={player.form}
            player={player}
            onPress={() => onPlayerPress?.(player)}
            selected={selectedPlayer === player.id}
          />
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.pitch}>
        {/* Field markings */}
        <View style={styles.centerCircle} />
        <View style={styles.centerLine} />
        <View style={styles.penaltyBoxTop} />
        <View style={styles.penaltyBoxBottom} />

        {/* Players */}
        <View style={{ position: 'absolute', width: '100%' }}>
          {renderPlayers(goalkeepers, 0.8)}
          {renderPlayers(defenders, 0.6)}
          {renderPlayers(midfielders, 0.4)}
          {renderPlayers(forwards, 0.2)}
          {/* {showBench && <View style={[{
            flexDirection: 'row',
            backgroundColor: 'red',
            // justifyContent: 'space-between',
            alignItems: 'center'
          }]}>
            <View>
              {renderPlayers(bench.filter(pl => pl.position === 12), 0.2)}
            </View>
            <View>
              {renderPlayers(bench.filter(pl => pl.position !== 12), 0.2)}
            </View>
          </View>} */}
        </View>
      </View>
      {showBench && renderPlayers(bench, 0.2)}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: PITCH_PADDING,
  },
  pitch: {
    width: PITCH_WIDTH,
    height: PITCH_HEIGHT,
    backgroundColor: '#2F7A32',
    borderRadius: 8,
    overflow: 'hidden',
  },
  centerCircle: {
    position: 'absolute',
    width: PITCH_WIDTH * 0.2,
    height: PITCH_WIDTH * 0.2,
    borderRadius: PITCH_WIDTH * 0.1,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -PITCH_WIDTH * 0.1 }, { translateY: -PITCH_WIDTH * 0.1 }],
  },
  centerLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#FFFFFF40',
    top: '50%',
  },
  penaltyBoxTop: {
    position: 'absolute',
    width: PITCH_WIDTH * 0.6,
    height: PITCH_HEIGHT * 0.2,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
    top: 0,
    left: '50%',
    transform: [{ translateX: -PITCH_WIDTH * 0.3 }],
  },
  penaltyBoxBottom: {
    position: 'absolute',
    width: PITCH_WIDTH * 0.6,
    height: PITCH_HEIGHT * 0.2,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -PITCH_WIDTH * 0.3 }],
  },
  topCardsContainer: {
    position: 'absolute',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    top: 20,
    paddingHorizontal: 15,
  },
  pointsContainer: {
    alignItems: 'center',
    width: 90,
    height: 100,
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10
  },
  points: {
    fontSize: 14,
  }
});