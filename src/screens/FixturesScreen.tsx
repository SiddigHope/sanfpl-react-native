import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import moment from 'moment';
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import TeamLogo from "../components/TeamLogo";
import { useFPLStore } from "../stores/fplStore";

export const FixturesScreen = ({ navigation }: any) => {
    const { fixtures, teams, currentGameweek, isLoading, refreshFixtures } = useFPLStore();
    const [selectedFixture, setSelectedFixture] = useState(null);
    const [visibleModal, setVisibleModal] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);
    const [refreshing, setRefreshing] = useState(false)

    const activeGameweek = currentGameweek + weekOffset;
    const getTeam = (id) => teams.find((t) => t.id === id);

    const weekFixtures = useMemo(() => {
        const gwFixtures = fixtures.filter((f) => f.event === activeGameweek);
        const grouped = gwFixtures.reduce((acc, fixture) => {
            const date = new Date(fixture.kickoff_time).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "short",
            });
            if (!acc[date]) acc[date] = [];
            acc[date].push(fixture);
            return acc;
        }, {});
        return Object.keys(grouped).map((date) => ({
            title: date,
            data: grouped[date].sort(
                (a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time)
            ),
        }));
    }, [fixtures, activeGameweek]);

    const refreshData = async () => {
        setRefreshing(true)
        await refreshFixtures()
            .catch(() => setRefreshing(false))
        setRefreshing(false)
    }

    const handleNext = () => setWeekOffset((p) => p + 1);
    const handlePrev = () => setWeekOffset((p) => (p > -currentGameweek ? p - 1 : p));

    const itemSeparator = () => (
        <View style={{ height: 1, backgroundColor: '#e3e3e3' }} />
    )
    const renderFixture = ({ item }) => {
        const home = getTeam(item.team_h);
        const away = getTeam(item.team_a);
        const isLive = item.started && !item.finished;
        const isFinished = item.finished;
        const isUpcoming = !item.started;

        // console.log(home);

        return (
            <ThemedView>
                <TouchableOpacity
                    style={[styles.card, isLive && styles.liveCard]}
                    onPress={() => {
                        navigation.navigate('MatchDetails', { fixtureId: item.id })
                    }}
                >
                    <View style={styles.row}>
                        {/* <Image source={{ uri: home?.logo }} style={styles.logo} /> */}
                        <TeamLogo code={home?.code} />
                        <ThemedText style={styles.team}>{home?.short_name}</ThemedText>
                        {/* <ThemedText style={styles.score}>
                            {isLive || isFinished ? item.team_h_score : ""}
                        </ThemedText> */}
                    </View>

                    {/* <ThemedText style={styles.vs}>vs</ThemedText> */}

                    {isUpcoming ? (
                        <ThemedText style={styles.time}>
                            {moment(item.kickoff_time).format('HH:mm')}
                        </ThemedText>
                    ) : isFinished || isLive ? (
                        <ThemedText style={styles.score}>
                            {`${item.team_h_score} - ${item.team_a_score} `}
                        </ThemedText>
                    ) : null}
                    <View style={styles.row}>
                        {/* <ThemedText style={styles.score}>
                            {isLive || isFinished ? item.team_a_score : ""}
                        </ThemedText> */}
                        <ThemedText style={styles.team}>{away?.short_name}</ThemedText>
                        <TeamLogo code={away?.code} />
                        {/* <Image source={{ uri: away?.logo }} style={styles.logo} /> */}
                    </View>

                    {isLive && <ThemedText style={styles.live}>LIVE</ThemedText>}

                </TouchableOpacity>
            </ThemedView>
        );
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.loading}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.arrow} onPress={handlePrev}>
                    <Ionicons name="chevron-back-outline" size={20} />
                </TouchableOpacity>
                <ThemedText style={styles.headerText}>GameWeek {activeGameweek}</ThemedText>
                <TouchableOpacity style={styles.arrow} onPress={handleNext}>
                    <Ionicons name="chevron-forward-outline" size={20} />
                </TouchableOpacity>
            </View>

            {/* Fixtures */}
            <SectionList
                sections={weekFixtures}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={refreshData}
                renderSectionHeader={({ section: { title } }) => (
                    <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
                )}
                renderItem={renderFixture}
                ItemSeparatorComponent={itemSeparator}
                contentContainerStyle={styles.list}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginBottom: 12
    },
    headerText: {
        fontSize: 16,
        fontWeight: "600"
    },
    arrow: {
        backgroundColor: '#e3e3e3',
        padding: 8,
        borderRadius: 30
    },
    list: {
        paddingBottom: 50
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "400",
        marginVertical: 8,
        textAlign: 'center',
        color: 'grey'
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10
    },
    liveCard: {
        borderColor: "red",
        borderWidth: 1
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
    },
    logo: {
        width: 26,
        height: 26,
        resizeMode: "contain"
    },
    team: {
        fontSize: 15
    },
    score: {
        fontSize: 16,
        fontWeight: "bold"
    },
    vs: {
        textAlign: "center",
        color: "#aaa",
        marginVertical: 6
    },
    live: {
        textAlign: "center",
        color: "red",
        fontWeight: "bold"
    },
    time: {
        color: "#999",
        textAlign: "center",
        marginTop: 4
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
});
