import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import PlayerImage from './PlayerImage';
import TeamLogo from './TeamLogo';
import TeamShirt from './TeamShirt';

interface PlayerCardProps {
  name: string;
  team: string;
  position: string;
  price: number;
  points?: number;
  form: string;
  onPress?: () => void;
  selected?: boolean;
  type?: string;
  shirt?: boolean;
  logo?: boolean;
  player?: object | any;
  opta_code?: string;
  isBenchGoalkeeper?: boolean;
  isBenched?: boolean;
  player_image?: boolean;
  statusColor?: string | any;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  opponent_short_name?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  name,
  team,
  position,
  price,
  points,
  form,
  onPress,
  selected = false,
  type = 'price',
  logo = false,
  shirt = false,
  opta_code = null,
  player_image = false,
  isBenchGoalkeeper = false,
  isBenched = false,
  statusColor,
  isCaptain = false,
  isViceCaptain = false,
  opponent_short_name
}) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <ThemedView
        style={[styles.container,
        selected && styles.selected,
        isBenchGoalkeeper && { marginRight: 30 },
        isBenched && { marginTop: 5 },
        isCaptain && styles.captainCard
        ]}
      >
        {isCaptain && (
          <View style={styles.captainBadge}>
            <ThemedText style={styles.captainText}>C</ThemedText>
          </View>
        )}
        {isViceCaptain && (
          <View style={styles.viceCaptainBadge}>
            <ThemedText style={styles.captainText}>V</ThemedText>
          </View>
        )}
        {shirt && <TeamShirt image={player?.element_type === 1 ? `${player?.team_code}_1` : player?.team_code} />}
        {player_image && <PlayerImage image={player?.code} />}
        {logo && <TeamLogo code={team} />}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.name}>{name}</ThemedText>
          {/* <ThemedText style={styles.team}>{team}</ThemedText> */}
        </ThemedView>

        {opponent_short_name && (
          <View style={styles.detailItem}>
            <ThemedText style={styles.team}>{opponent_short_name}</ThemedText>
          </View>
        )}
        <View style={styles.details}>
          {type === 'points' ? (
            <View style={styles.detailItem}>
              {/* <ThemedText style={styles.label}>PTS</ThemedText> */}
              <ThemedText style={styles.value}>{points}</ThemedText>
            </View>
          ) : type === "price" ? (
            <View style={styles.detailItem}>
              {/* <ThemedText style={styles.label}>£</ThemedText> */}
              <ThemedText style={styles.value}>{(price / 10).toFixed(1)}m</ThemedText>
            </View>
          ) : null}

        </View>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginVertical: 6,
    marginHorizontal: 3,
    shadowColor: '#1d0f0fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#3D619B',
  },
  header: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    // marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
  },
  team: {
    fontSize: 10,
    opacity: 0.8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
    // flex: 1
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    // textAlign: 'center',
  },
  captainCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
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
    right: -8,
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
});