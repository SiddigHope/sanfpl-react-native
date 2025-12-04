import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    StyleSheet,
    TextInput
} from 'react-native';
import { useFPLStore } from '../stores/fplStore';

const TEAM_ID_KEY = '@sanfpl:team_id';

export default function EnterTeamIdTextInput() {
    const { t } = useTranslation()
    const {
        teamId,
        setTeamId,
    } = useFPLStore();
    const [inputTeamId, setInputTeamId] = useState(teamId || '1565727');

    const handleTeamIdSubmit = async () => {
        if (inputTeamId) {
            await AsyncStorage.setItem(TEAM_ID_KEY, inputTeamId);
            setTeamId(inputTeamId);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>{t('enter_team_id')}</ThemedText>
            <TextInput
                style={styles.input}
                value={inputTeamId}
                onChangeText={setInputTeamId}
                keyboardType="numeric"
                placeholder="Team ID"
                onSubmitEditing={handleTeamIdSubmit}
                returnKeyType="done"
            />
        </ThemedView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        padding: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 40,
        marginTop: 16,
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#3D619B',
    },
});