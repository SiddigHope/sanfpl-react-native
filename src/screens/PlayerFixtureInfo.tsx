import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PlayerImage from "../components/PlayerImage";
import { useFPLStore } from "../stores/fplStore";

type RouteParams = {
    playerId: number;
    fixtureId: number;
    player: any;
};

export const PlayerFixtureInfo = () => {
    const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
    const { playerId, fixtureId: initialFixtureId, player: playerInfo } = route.params;

    const { teams, isLoading, fixtures, currentGameweek, players } = useFPLStore();
    const [playerData, setPlayerData] = useState<any>(null);
    const [fixtureIndex, setFixtureIndex] = useState(0);
    const [isFetching, setIsFetching] = useState(true);

    // Fetch player stats from FPL API
    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setIsFetching(true);
                const res = await fetch(
                    `https://fantasy.premierleague.com/api/element-summary/${playerId}/`
                );
                const data = await res.json();
                setPlayerData(data);
            } catch (error) {
                console.error("Error fetching player fixture data:", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchPlayerData();
    }, [playerId]);

    // Extract all played fixtures for that player
    const fixtureHistory = useMemo(() => playerData?.history || [], [playerData]);

    // Determine current fixture index based on fixtureId
    useEffect(() => {
        if (!fixtureHistory.length) return;
        // fixtureHistory.map((fi) => console.log(fi))
        const index = fixtureHistory.findIndex(
            (f: any) => f.round === initialFixtureId
        );
        if (index !== -1) setFixtureIndex(index);
    }, [fixtureHistory, initialFixtureId]);

    const nextFixtures = useMemo(() => {
        if (!playerInfo) return [];
        return fixtures
            .filter((f: any) =>
                (f.team_h === playerInfo.team || f.team_a === playerInfo.team) &&
                f.event >= currentGameweek
            )
            .slice(0, 5)
            .map((f: any) => {
                const isHome = f.team_h === playerInfo.team;
                const opponent = teams.find(t => t.id === (isHome ? f.team_a : f.team_h));
                return {
                    event: f.event,
                    opponent: opponent?.short_name || '',
                    isHome,
                    difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty
                };
            });
    }, [fixtures, playerInfo, teams, currentGameweek]);

    const currentFixture = fixtureHistory[fixtureIndex];

    const handlePrev = () =>
        setFixtureIndex((prev) => (prev > 0 ? prev - 1 : prev));

    const handleNext = () =>
        setFixtureIndex((prev) =>
            prev < fixtureHistory.length - 1 ? prev + 1 : prev
        );

    const team = useMemo(() => {
        return teams.find((t) => t.id === currentFixture?.opponent_team);
    }, [teams, currentFixture]);

    const renderStatItem = (label: string, value: any) => (
        <View style={styles.statItem} key={label}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value ?? "—"}</Text>
        </View>
    );

    if (isLoading || isFetching) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    if (!currentFixture) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.errorText}>
                    No fixture data available.
                </ThemedText>
            </ThemedView>
        );
    }

     const renderFixture = (fixture: any, index: number) => (
        <View key={index} style={styles.fixtureItem}>
          <ThemedText style={styles.fixtureEvent}>GW{fixture.event}</ThemedText>
          <ThemedText style={styles.fixtureOpponent}>
            {fixture.isHome ? 'vs' : '@'} {fixture.opponent}
          </ThemedText>
          <View 
            style={[
              styles.difficultyIndicator,
              { backgroundColor: getDifficultyColor(fixture.difficulty) }
            ]}
          >
            <ThemedText style={styles.difficultyText}>{fixture.difficulty}</ThemedText>
          </View>
        </View>
      );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={handlePrev}>
                    <ThemedText style={styles.arrow}>◀️</ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.headerText}>
                    GW{currentFixture.round} vs {team?.short_name || "—"}
                </ThemedText>

                <TouchableOpacity onPress={handleNext}>
                    <ThemedText style={styles.arrow}>▶️</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* Player Info */}
            <ThemedView style={styles.playerHeader}>
                <PlayerImage image={playerInfo.code} {...styles.playerImage} />
                <View style={styles.playerDetails}>
                    <ThemedText style={styles.playerName}>
                        {playerInfo?.web_name ?? "Player"}
                    </ThemedText>
                    <ThemedText style={styles.fixtureOpponent}>
                        {currentFixture.was_home ? "Home vs" : "Away @"}{" "}
                        {team?.name || "Unknown"}
                    </ThemedText>
                </View>
            </ThemedView>

            {/* Stats */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Match Performance</ThemedText>
                <View style={styles.statsGrid}>
                    {renderStatItem("Minutes", currentFixture.minutes)}
                    {renderStatItem("Goals", currentFixture.goals_scored)}
                    {renderStatItem("Assists", currentFixture.assists)}
                    {renderStatItem("Clean Sheets", currentFixture.clean_sheets)}
                    {renderStatItem("Goals Conceded", currentFixture.goals_conceded)}
                    {renderStatItem("Bonus", currentFixture.bonus)}
                    {renderStatItem("BPS", currentFixture.bps)}
                    {renderStatItem("Total Points", currentFixture.total_points)}
                </View>
            </ThemedView>

            {/* Message for bench players */}
            {currentFixture.minutes === 0 && (
                <ThemedText style={styles.benchText}>
                    Player did not play in this fixture.
                </ThemedText>
            )}

            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Next 5 Fixtures</ThemedText>
                <View style={styles.fixturesList}>
                    {nextFixtures.map(renderFixture)}
                </View>
            </ThemedView>

        </ScrollView>
    );
};

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1: return '#00FF87'; // Very Easy
    case 2: return '#7CBA00'; // Easy
    case 3: return '#FFC000'; // Medium
    case 4: return '#FF7F00'; // Hard
    case 5: return '#FF3B30'; // Very Hard
    default: return '#808080'; // Unknown
  }
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    headerText: { fontSize: 18, fontWeight: "bold" },
    arrow: { fontSize: 22, padding: 8 },
    playerHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    playerImage: { width: 110, height: 140, borderRadius: 8, marginRight: 16 },
    playerDetails: { flex: 1 },
    playerName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statItem: {
        width: "48%",
        marginBottom: 10,
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        padding: 10,
    },
    statLabel: { fontSize: 12, color: "#777" },
    statValue: { fontSize: 16, fontWeight: "bold" },
    errorText: { textAlign: "center", marginTop: 20, color: "red" },
    benchText: {
        textAlign: "center",
        color: "#888",
        marginBottom: 20,
        fontStyle: "italic",
    },
    fixturesList: {
        marginTop: 8,
    },
    fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fixtureEvent: {
    width: 50,
    fontSize: 14,
  },
    // fixtureOpponent: { fontSize: 16, color: "#666" },
  fixtureOpponent: {
    flex: 1,
    fontSize: 14,
  },
  difficultyIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
