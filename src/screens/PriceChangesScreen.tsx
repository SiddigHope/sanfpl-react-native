import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { PlayerCardStats } from '../components/PlayerCardStats';
import { APP_CONFIG } from '../config/constants';
import { useFPLStore } from '../stores/fplStore';
import { normalize } from '../utils/normalizePlayerName';

type Position = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';
type PredictedStatus = 'rise_soon' | 'drop_soon' | 'rising' | 'dropping' | 'stable' | 'already_raised' | 'already_dropped';

interface EnrichedPlayer {
  id: number;
  web_name: string;
  team_short_name: string;
  position: string;
  now_cost: number;
  photo: string;
  predicted_status: PredictedStatus;
  progress: number;
  code: number;
  total_points: number|any;
  form: number| any;
}


const tabs: (PredictedStatus | 'all')[] = [
  'all',
  'rise_soon',
  'drop_soon',
  'rising',
  'dropping',
  'already_raised',
  'already_dropped',
];

export default function PriceChangesScreen() {
  const { t } = useTranslation();
  const { players, teams, isLoading, fetchGlobalData } = useFPLStore();
  const [selectedPosition, setSelectedPosition] = useState<Position>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  // new:
  const [computing, setComputing] = useState(false);
  const [enrichedPlayersCache, setEnrichedPlayersCache] = useState<EnrichedPlayer[]>([]);
  const [activeTab, setActiveTab] = useState<PredictedStatus | 'all'>('all');

  // compute enriched players (async-ish) and cache them so screen mounts instantly
  useEffect(() => {
    if (!players || players.length === 0 || !teams || teams.length === 0) {
      setEnrichedPlayersCache([]);
      return;
    }

    setComputing(true);

    // small timeout so the UI mounts quickly, then we compute heavy map
    const t = setTimeout(() => {
      const enriched = players.map(player => {
        const team = teams.find(t => t.id === player.team);
        // build safe photo URL (player.photo is like "12345.jpg" or "p12345.jpg")
        const rawPhoto = String(player.code ?? '');
        const num = rawPhoto.replace(/^p/, '').replace('.jpg', '').padStart(6, '0'); // pad
        const photoUrl = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${num}.png`;

        const { status, progress } = calculatePredictedStatus(player);

        return {
          id: player.id,
          web_name: player.web_name,
          team_short_name: team?.short_name || '',
          position: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
          now_cost: Number(player.now_cost ?? 0),
          photo: photoUrl,
          predicted_status: status,
          progress,
          code: player.code ?? 0,
          total_points: player.total_points,
          form: player.form,
          // carry-through other useful fields for UI if needed:
          transfers_in_event: Number(player.transfers_in_event ?? 0),
          transfers_out_event: Number(player.transfers_out_event ?? 0),
          selected_by_percent: player.selected_by_percent ?? '0',
        } as EnrichedPlayer;
      });

      setEnrichedPlayersCache(enriched);
      setComputing(false);
    }, 60); // tiny delay

    return () => clearTimeout(t);
  }, [players, teams, selectedPosition, searchQuery]);

  const filteredAndSortedPlayers = useMemo(() => {
    const list = enrichedPlayersCache || [];
    const filtered = list.filter(player => {
      const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;
      const q = normalize(searchQuery.trim());
      const name = normalize(player.web_name);
      const team = normalize(player.team_short_name);
      const matchesSearch = q === '' || name.includes(q) || team.includes(q);
      // const matchesSearch = q === '' || player.web_name.toLowerCase().includes(q) || player.team_short_name.toLowerCase().includes(q);
      return matchesPosition && matchesSearch;
    });

    const statusPriority: Record<PredictedStatus, number> = {
      rise_soon: 0,
      rising: 1,
      drop_soon: 2,
      dropping: 3,
      already_raised:4,
      already_dropped:5,
      stable: 6
    };

    return filtered.sort((a, b) => {
      const p = statusPriority[a.predicted_status] - statusPriority[b.predicted_status];
      if (p !== 0) return p;
      return b.progress - a.progress;
    });
  }, [enrichedPlayersCache, selectedPosition, searchQuery]);


  // const calculatePredictedStatus = (player: any): { status: PredictedStatus; progress: number } => {
  //   const NTI = player.transfers_in_event - player.transfers_out_event;
  //   const riseThreshold = 300000;
  //   const dropThreshold = Math.max(player.selected_by_percent * 10000, 10000);

  //   const riseRatio = NTI / riseThreshold;
  //   const dropRatio = -NTI / dropThreshold;

  //   if (riseRatio >= 1) return { status: 'rise_soon', progress: 1 };
  //   if (dropRatio >= 1) return { status: 'drop_soon', progress: 1 };
  //   if (riseRatio > 0) return { status: 'rising', progress: riseRatio };
  //   if (dropRatio > 0) return { status: 'dropping', progress: dropRatio };
  //   return { status: 'stable', progress: 0 };
  // };

  const calculatePredictedStatus = (player: any): { status: PredictedStatus; progress: number } => {
    // Defensive parsing
    const transfersIn = Number(player.transfers_in_event ?? 0);
    const transfersOut = Number(player.transfers_out_event ?? 0);
    const NTI = transfersIn - transfersOut;

    // Ownership in fraction (e.g., 0.05 for 5%)
    const ownershipPct = (parseFloat(String(player.selected_by_percent ?? '0')) / 100) || 0.001;

    // Base thresholds (community-estimates)
    // const baseRise = 300000; // baseline net transfers for a mainstream player
    // const baseDrop = 10000;  // baseline for drop (scaled by ownership)

    const baseRise = 80000;
    const baseDrop = 20000;

    // Adjust thresholds by ownership:
    // Lower ownership -> easier to trigger a rise (less net transfers needed)
    // Higher ownership -> requires more net transfers to trigger a rise
    // const riseThreshold = Math.max(5000, Math.round(baseRise * Math.max(0.2, ownershipPct / 0.05)));
    // const dropThreshold = Math.max(baseDrop, Math.round(baseDrop * Math.max(0.5, ownershipPct * 1000)));
    const riseThreshold = Math.max(15000, Math.round(baseRise * Math.max(0.4, ownershipPct / 0.05)));
    const dropThreshold = Math.max(10000, Math.round(baseDrop * Math.max(0.4, ownershipPct / 0.05)));
    // Locking / recent price-change protection:
    // Some players are price-protected after recent changes; check cost change fields:
    const changedThisEvent = Number(player.cost_change_event ?? 0);
    const changedSinceStart = Number(player.cost_change_start ?? 0);
    const recentlyChanged = Math.abs(changedThisEvent) >= 1 || Math.abs(changedSinceStart) >= 1;
    if (recentlyChanged) {
      // if price has already moved recently, reduce sensitivity (avoid false positives)
      // We still compute, but bias toward stable
    }

    const riseRatio = NTI / riseThreshold;
    const dropRatio = -NTI / dropThreshold;

    // clamp progress reasonably
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    // If NTI is very small, treat as stable
    if (Math.abs(NTI) < Math.max(10, Math.round(ownershipPct * 1000))) {
      return { status: 'stable', progress: 0 };
    }

      // Detect already changed
    const costDiff = player.cost_change_event ?? 0; // +1 or -1 if changed
    if (costDiff > 0) return { status: 'already_raised', progress: 1 };
    if (costDiff < 0) return { status: 'already_dropped', progress: 1 };

    if (riseRatio >= 1) return { status: 'rise_soon', progress: 1 };
    if (dropRatio >= 1) return { status: 'drop_soon', progress: 1 };
    if (riseRatio > 0) return { status: 'rising', progress: clamp(riseRatio) };
    if (dropRatio > 0) return { status: 'dropping', progress: clamp(dropRatio) };

    return { status: 'stable', progress: 0 };
  };


  // const getStatusColor = (status: PredictedStatus): string => {
  //   switch (status) {
  //     case 'rise_soon':
  //     case 'rising':
  //       return APP_CONFIG.THEME.LIGHT.success;
  //     case 'drop_soon':
  //     case 'dropping':
  //       return APP_CONFIG.THEME.LIGHT.error;
  //     default:
  //       return APP_CONFIG.THEME.LIGHT.card;
  //   }
  // };

  // the bellow function is replaced with the above useEffect (it runs whenever players or teams change)
  // const getEnrichedPlayers = (): EnrichedPlayer[] => {
  //   return players
  //     .map(player => {
  //       const team = teams.find(t => t.id === player.team);
  //       const { status, progress } = calculatePredictedStatus(player);
  //       return {
  //         id: player.id,
  //         web_name: player.web_name,
  //         team_short_name: team?.short_name || '',
  //         position: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
  //         now_cost: player.now_cost,
  //         photo: player.code,
  //         predicted_status: status,
  //         progress,
  //         opta_code: player.opta_code,
  //         code: player.code
  //       };
  //     })
  //     .filter(player => {
  //       const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;
  //       const matchesSearch = player.web_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         player.team_short_name.toLowerCase().includes(searchQuery.toLowerCase());
  //       return matchesPosition && matchesSearch;
  //     })
  //     .sort((a, b) => {
  //       // Sort by status priority and progress
  //       const statusPriority = {
  //         rise_soon: 0,
  //         rising: 1,
  //         drop_soon: 2,
  //         dropping: 3,
  //         stable: 4
  //       };
  //       return statusPriority[a.predicted_status] - statusPriority[b.predicted_status] ||
  //         b.progress - a.progress;
  //     });
  // };

  
const getStatusColor = (status: PredictedStatus): string => {
  switch (status) {
    case 'rise_soon': return '#22c55e';
    case 'drop_soon': return '#ef4444';
    case 'rising': return '#86efac';
    case 'dropping': return '#fca5a5';
    case 'already_raised': return '#16a34a';
    case 'already_dropped': return '#dc2626';
    case 'stable': return '#a1a1aa';
    default: return '#3b82f6';
  }
};

  const positions: Position[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  const renderStatusGroup = (players: EnrichedPlayer[]) => {
    // const filteredPlayers = players.filter(p => p.predicted_status === status);
    const filteredPlayers = activeTab === 'all'
      ? players.filter(p =>
          p.predicted_status === 'rise_soon' || p.predicted_status === 'drop_soon'
        ).slice(0, 10)
      : players.filter(p => p.predicted_status === activeTab);

    if (filteredPlayers.length === 0) return null;

    const getStatusTitle = (tab: string) => {
      switch (tab) {
        case 'rise_soon': return '🔼 Likely to Rise';
        case 'drop_soon': return '🔽 Likely to Drop';
        case 'rising': return '📈 Rising';
        case 'dropping': return '📉 Dropping';
        case 'already_raised': return '✅ Already Raised';
        case 'already_dropped': return '🔻 Already Dropped';
        case 'stable': return '➖ Stable';
        default: return 'All';
      }
    };

    return (
      <View style={styles.statusGroup}>
        {/* <ThemedText style={styles.groupTitle}>{getStatusTitle()}</ThemedText> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.filterButton,
              tab === activeTab && styles.filterButtonActive
            ]}
            >
            <ThemedText
             style={[
                styles.filterText,
                tab === activeTab && styles.filterTextActive
              ]}
             >
              {tab === 'all' ? 'All' : getStatusTitle(tab)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
        {filteredPlayers.map(player => (
          <PlayerCardStats
            key={player.id}
            name={player.web_name}
            player={player}
            form={player.form}
            points={player.total_points}
            team={player.team_short_name}
            position={player.position}
            price={player.now_cost}
            showPhoto={true}
            statusColor={getStatusColor(player.predicted_status)}
            progress={player.progress}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchGlobalData}
        />
      }
      stickyHeaderIndices={[0]}
    >
      <ThemedView style={styles.header}>
        <View style={{margin: 16}}>
          <ThemedText style={styles.title}>Price Change Predictions</ThemedText>
        <TextInput
          style={styles.searchInput}
          placeholder="Search player or team..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
        </View>
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

      {isLoading || computing ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={APP_CONFIG.THEME.LIGHT.primary} />
          <ThemedText style={{ marginTop: 12 }}>
            {isLoading ? t('loading_data') : t('calculating_predictions')}
          </ThemedText>
        </View>
      ) : (
      <View style={styles.content}>
        {/* {['rise_soon', 'drop_soon', 'rising', 'dropping', 'stable'].map((status) =>
          renderStatusGroup(status as PredictedStatus, filteredAndSortedPlayers)
        )} */}
          {renderStatusGroup(filteredAndSortedPlayers)}
       
      </View>
    )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E9E9EB',
  },
  filterButtonActive: {
    backgroundColor: APP_CONFIG.THEME.LIGHT.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  statusGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});