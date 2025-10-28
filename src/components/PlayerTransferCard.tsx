import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import PlayerImage from './PlayerImage';

interface PlayerTransferCardProps {
  name: string;
  team: string;
  position: string|number;
  price: number;
  points: number;
  form: string;
  onPress?: () => void;
  selected?: boolean;
  player?: any | object;
  photo?: string | object;
  showPhoto?: boolean;
  statusColor?: string | any;
  progress?: number | any;
}

export const PlayerTransferCard: React.FC<PlayerTransferCardProps> = ({
  player,
  name,
  team,
  position,
  price,
  points,
  form,
  onPress,
  selected = false,
  photo = null,
  showPhoto = false,
  statusColor,
  progress
}) => {
  const theme = useThemeStore((state) => state.theme);
  const positionMapping = typeof position === 'number'?['GK','DEF','MID','FWD'][position -1]:position 
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView
        style={[styles.container, styles.details, { justifyContent: 'center' }]}
      >
        {showPhoto && <PlayerImage width={50} height={80} image={player?.code} />}
        <ThemedView
          style={[selected && styles.selected, showPhoto && { flex: 1, marginHorizontal: 10 }]}
        >
          <View style={styles.header}>
            <ThemedText style={styles.name}>{name}</ThemedText>
            <ThemedText style={styles.team}>{team}</ThemedText>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>POS</ThemedText>
              <ThemedText style={styles.value}>{positionMapping}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>£</ThemedText>
              <ThemedText style={styles.value}>{(price / 10).toFixed(1)}m</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>PTS</ThemedText>
              <ThemedText style={styles.value}>{points}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>FORM</ThemedText>
              <ThemedText style={styles.value}>{form}</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ThemedView>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#3D619B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  team: {
    fontSize: 14,
    opacity: 0.8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});