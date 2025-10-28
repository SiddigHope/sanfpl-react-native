import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PlayerTransferCard } from '../components/PlayerTransferCard';
import { useFPLStore } from '../stores/fplStore';

export default function TransferPlayerSelection({ navigation, route }:any) {
    const { currentTeam, selectedPlayer, inBank, makeTransfer } = route.params
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
  const [transferPlayer, setTransferPlayer] = useState(null);

    const {
        players,
        teams,
        fixtures,
        currentGameweek,
        teamId,
        userTeam,
        isLoading,
        error,
        bank,
        fetchUserTeam
    } = useFPLStore();

    const handleTransfer = (player: any) => {
        makeTransfer(player)
        setShowModal(false)
        navigation.goBack()
    }

    const selectPlayer = (player: any) => {
        setTransferPlayer(player)
        setShowModal(true)
    }

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
                            navigation.navigate('PlayerInfo', { playerId: transferPlayer?.id });
                        }}
                    >
                        <ThemedText style={styles.modalOptionText}>Player Info</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleTransfer(transferPlayer)}
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

    const availablePlayers = players
        .filter(p => {
            const isInTeam = [...currentTeam?.starting, ...currentTeam?.bench].some(tp => tp.id === p.id);
            const matchesPosition = p.element_type === selectedPlayer?.element_type;
            const matchesSearch = p.web_name.toLowerCase().includes(searchQuery.toLowerCase());
            return !isInTeam && matchesPosition && matchesSearch;
        })
    return (
        <ThemedView style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search players..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={availablePlayers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <PlayerTransferCard
                        key={item.id}
                        name={item.web_name}
                        player={item}
                        form={item.form}
                        points={item.total_points}
                        team={item.team_short_name}
                        position={item.element_type}
                        price={item.now_cost}
                        showPhoto={true}
                        onPress={() => selectPlayer(item)}
                    />
                )}
            />
            {renderPlayerModal()}
        </ThemedView>
    );
}


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
        maxHeight: '80%',
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
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
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
