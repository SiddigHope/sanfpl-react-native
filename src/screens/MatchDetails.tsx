import images from "@/assets/images";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ImageBackground } from "expo-image";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import TeamLogo from "../components/TeamLogo";
import { useFPLStore } from "../stores/fplStore";

export const MatchDetails = ({ route }) => {
  const { fixtureId } = route.params;
  const { fixtures, teams, players } = useFPLStore();
  const [homeBackgroundColor, setHomeBackgroundColor] = useState('')
  const [awayBackgroundColor, setAwayBackgroundColor] = useState('')

  const fixture = fixtures.find((f) => f.id === fixtureId);

  const homeTeam = teams.find((t) => t.id === fixture?.team_h);
  const awayTeam = teams.find((t) => t.id === fixture?.team_a);

  const getPlayer = (id) => players.find((p) => p.id === id) || {};

  // Helper to extract stats from fixture
  const getStat = (identifier) => {
    const stat = fixture?.stats?.find((s) => s.identifier === identifier);
    return {
      home:
        stat?.h.map((e) => ({ ...getPlayer(e.element), value: e.value })) || [],
      away:
        stat?.a.map((e) => ({ ...getPlayer(e.element), value: e.value })) || [],
    };
  };

  const goals = getStat("goals_scored");
  const assists = getStat("assists");
  const yellow = getStat("yellow_cards");
  const red = getStat("red_cards");
  const saves = getStat("saves");
  const bonus = getStat("bonus");
  const bps = getStat("bps"); // bonus points system
  const defensive = getStat("influence"); // approximation for defensive contributions

  const kickoff = fixture
    ? new Date(fixture.kickoff_time).toLocaleString()
    : "";

  const renderStatRow = (label, left, right) => {
    if (!left.length && !right.length) return null;
    return (
      <View style={styles.statRow}>
        <View style={styles.side}>
          {left.map((p, i) => (
            <ThemedText key={i} style={styles.playerText}>
              {p.web_name} {p.value > 1 ? `(${p.value})` : ""}
            </ThemedText>
          ))}
        </View>

        <ThemedText style={styles.statLabel}>{label}</ThemedText>

        <View style={[styles.side, styles.rightSide]}>
          {right.map((p, i) => (
            <ThemedText key={i} style={[styles.playerText, styles.alignRight]}>
              {p.web_name} {p.value > 1 ? `(${p.value})` : ""}
            </ThemedText>
          ))}
        </View>
      </View>
    );
  };

  if (!fixture) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No match data found</ThemedText>
      </ThemedView>
    );
  }

  const notStarted = !fixture.started;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={images.pitch}
        style={{ height: 150, justifyContent: 'center' }}
      // blurRadius={2}
      >
        <ThemedView style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.7 }} />
        <View style={styles.header}>
          <View style={[styles.teamBox, homeBackgroundColor && {backgroundColor: homeBackgroundColor}]}>
            {/* <Image source={{ uri: homeTeam?.logo }} style={styles.logo} /> */}
            <TeamLogo
              code={homeTeam?.code}
              calculateColor={true}
              setColor={setHomeBackgroundColor}
            />
            <ThemedText style={styles.teamShort}>{homeTeam?.short_name}</ThemedText>
          </View>

          <View style={styles.scoreBox}>
            <ThemedText style={styles.scoreText}>
              {fixture.team_h_score ?? "-"} - {fixture.team_a_score ?? "-"}
            </ThemedText>
          </View>

          <View style={[styles.teamBox, awayBackgroundColor && {backgroundColor: awayBackgroundColor}]}>
            <ThemedText style={styles.teamShort}>{awayTeam?.short_name}</ThemedText>
            {/* <Image source={{ uri: awayTeam?.logo }} style={styles.logo} /> */}
            <TeamLogo
              code={awayTeam?.code}
              calculateColor={true}
              setColor={setAwayBackgroundColor}
            />
          </View>
        </View>
      </ImageBackground>


      <ThemedText style={styles.gwText}>Gameweek {fixture.event}</ThemedText>

      {notStarted ? (
        <View style={styles.centered}>
          <ThemedText style={styles.notStartedText}>
            Match not started yet
          </ThemedText>
          <ThemedText style={styles.kickoffText}>{kickoff}</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {renderStatRow("Goals", goals.home, goals.away)}
          {renderStatRow("Assists", assists.home, assists.away)}
          {renderStatRow("Yellow Cards", yellow.home, yellow.away)}
          {renderStatRow("Red Cards", red.home, red.away)}
          {renderStatRow("Saves", saves.home, saves.away)}
          {renderStatRow("Bonus", bonus.home, bonus.away)}
          {renderStatRow("Bonus Points System", bps.home, bps.away)}
          {renderStatRow("Defensive Contributions", defensive.home, defensive.away)}
        </ScrollView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    margin: 10,
  },
  teamBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreBox: { paddingHorizontal: 15 },
  scoreText: { fontSize: 28, fontWeight: "bold", color: "#000" },
  teamShort: { fontSize: 16, fontWeight: "bold", color: "#000", marginHorizontal: 6 },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  gwText: { textAlign: "center", color: "#666", marginVertical: 8 },
  scroll: { paddingBottom: 50 },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  statLabel: {
    fontWeight: "600",
    color: "#444",
    width: 100,
    textAlign: "center",
  },
  side: { flex: 1 },
  rightSide: { alignItems: "flex-end" },
  playerText: { fontSize: 13, color: "#222", marginVertical: 2 },
  alignRight: { textAlign: "right" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  notStartedText: { fontSize: 16, fontWeight: "bold", color: "#444" },
  kickoffText: { marginTop: 4, color: "#666" },
});
