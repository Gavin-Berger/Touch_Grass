import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const Log: React.FC = () => {
    const [sessions, setSessions] = useState<{ steps: number; duration: string; timestamp: string }[]>([]);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const savedSessions = await AsyncStorage.getItem('sessions');
                if (savedSessions) {
                    setSessions(JSON.parse(savedSessions));
                } else {
                    setSessions([]); // Load empty array if no data
                }
            } catch (error) {
                console.error("Failed to load sessions:", error);
            }
        };
        loadSessions();
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    // Delete a session
    const deleteSession = async (index: number) => {
        Alert.alert(
            "Delete Session",
            "Are you sure you want to delete this session?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const updatedSessions = sessions.filter((_, i) => i !== index);
                        setSessions(updatedSessions);
                        await AsyncStorage.setItem('sessions', JSON.stringify(updatedSessions));
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Run Log</Text>
            <FlatList
                data={sessions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.sessionItem}>
                        <View style={styles.sessionInfo}>
                            <Text style={styles.text}>Steps: {item.steps}</Text>
                            <Text style={styles.text}>Duration: {item.duration}</Text>
                            <Text style={styles.text}>Completed At: {formatDate(item.timestamp)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteSession(index)} style={styles.deleteButton}>
                            <MaterialIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No logs available</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        padding: 20,
    },
    heading: {
        fontSize: 24,
        color: '#D4EDDA',
        marginBottom: 20,
        textAlign: 'center',
    },
    sessionItem: {
        backgroundColor: '#232323',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sessionInfo: {
        flex: 1,
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    deleteButton: {
        paddingHorizontal: 10,
    },
});

export default Log;
