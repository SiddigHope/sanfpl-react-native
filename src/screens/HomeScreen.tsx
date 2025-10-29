import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PlayerCardStats } from '../components/PlayerCardStats';
import { useFPLStore } from '../stores/fplStore';

const screens = [
  { id: 1, name: 'My Team', navigate: 'MyTeam' },
  { id: 2, name: 'Team Rating', navigate: 'TeamRating' },
  { id: 3, name: 'Price Changes', navigate: 'Fixtures' },
  { id: 4, name: 'Stats', navigate: 'Stats' }
]
export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const {
    players,
    currentGameweek,
    isLoading,
    fetchGlobalData
  } = useFPLStore();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const topPerformers = players
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 3);

  const getPositionName = (elementType: number) => {
    switch (elementType) {
      case 1: return 'GK';
      case 2: return 'DEF';
      case 3: return 'MID';
      case 4: return 'FWD';
      default: return '';
    }
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
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{t('home')}</ThemedText>
        <ThemedText style={styles.gameweek}>
          Gameweek {currentGameweek}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Top Performers
        </ThemedText>
        {topPerformers.map((player) => (
          <PlayerCardStats
            player={player}
            key={player.id}
            name={player.web_name}
            team={player.team.toString()}
            position={getPositionName(player.element_type)}
            price={player.now_cost}
            points={player.total_points}
            form={player.form}
            showPhoto={true}
          />
        ))}
      </ThemedView>

      <View style={styles.quickActions}>
        {screens.map((screen: any) => (
          <ThemedView
            key={screen.id}
            style={styles.actionButton}>
            <TouchableOpacity
              onPress={() => navigation.navigate(screen.navigate)}
            // style={styles.actionButton}
            >
              <ThemedText>{screen.name}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </View>
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
    marginBottom: 8,
  },
  gameweek: {
    fontSize: 16,
    opacity: 0.8,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
});