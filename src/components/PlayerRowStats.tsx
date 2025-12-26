import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import useNav from '../utils/navigationHelper';
import PlayerImage from './PlayerImage';

interface PlayerRowStatsProps {
  name: string;
  team: string;
  position: string;
  price: number;
  points: number;
  form: string;
  onPress?: () => void;
  selected?: boolean;
  player?: any | object;
  photo?: string | object;
  showPhoto?: boolean;
  statusColor?: string | any;
  disabled?: boolean;
  progress?: number | any;
  height?: number | any;
  status?: string | any;
}

export const PlayerRowStats: React.FC<PlayerRowStatsProps> = ({
  player,
  name,
  team,
  position,
  price,
  points,
  form,
  onPress,
  disabled = false,
  selected = false,
  photo = null,
  showPhoto = false,
  statusColor,
  progress,
  height,
  status
}) => {
  const theme = useThemeStore((state) => state.theme);
  const { navigate } = useNav()
  const [statusIcon, setStatusIcon] = useState({ name: 'arrow-up-circle', color: 'grey' });
  console.log(String(status).includes('rise'));

  useEffect(() => {
    if (String(status).includes('drop')) {
      setStatusIcon({ name: 'arrow-down-circle', color: 'red' });
    } else {
      setStatusIcon({ name: 'arrow-up-circle', color: 'green' });
    }
  }, [status]);

  const handlePress = () => {
    navigate('PlayerInfo', { playerId: player.id })
  }

  const derivedStats = useMemo(() => {
    if (!player) return { xg: 0, xga: 0, xgi: 0 };
    const xg = Number(player.threat) / 200;
    const xga = Number(player.creativity) / 200;
    const xgi = xg + xga;
    return {
      xg: xg.toFixed(2),
      xga: xga.toFixed(2),
      xgi: xgi.toFixed(2),
    };
  }, [player]);

  return (
    <TouchableOpacity onPress={onPress ?? handlePress} disabled={disabled}>
      <ThemedView
        style={[styles.container, styles.details, { justifyContent: 'center' }]}
      >
        {showPhoto && <PlayerImage width={50} height={50} image={player?.code} />}
        <ThemedView
          style={[selected && styles.selected, showPhoto && { flex: 1, marginHorizontal: 10 }]}
        >
          <View style={styles.details}>
            <View>
              <ThemedText style={styles.name}>{name}</ThemedText>
              <ThemedText style={styles.team}>{`${team} (${position})`}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>£</ThemedText>
              <ThemedText style={styles.value}>{(price / 10).toFixed(1)}m</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>xG</ThemedText>
              <ThemedText style={styles.value}>{derivedStats.xg}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>xGA</ThemedText>
              <ThemedText style={styles.value}>{derivedStats.xga}</ThemedText>
            </View>

            {/* <View style={styles.detailItem}>
              <ThemedText style={styles.label}>PTS</ThemedText>
              <ThemedText style={styles.value}>{points}</ThemedText>
            </View> */}

            <View style={styles.detailItem}>
              <ThemedText style={styles.label}>O.By</ThemedText>
              <ThemedText style={styles.value}>{player.selected_by_percent}%</ThemedText>
            </View>
            {/*<View style={styles.detailItem}>
              <ThemedText style={styles.label}>FORM</ThemedText>
              <ThemedText style={styles.value}>{form}</ThemedText>
            </View>*/}

            <View style={styles.detailItem}>
              <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
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
    paddingVertical: 5,
    marginVertical: 6,
    // marginHorizontal: 16,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  team: {
    fontSize: 12,
    opacity: 0.8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    // flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
  },
  overlay: {
    borderWidth: 0.5,
  }
});