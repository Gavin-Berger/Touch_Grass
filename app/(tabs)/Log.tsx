
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Log: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);

    // Load sessions from AsyncStorage on mount
    useEffect(() => {
        const loadSessions = async () => {
            const savedSessions = await AsyncStorage.getItem('sessions');
            if (savedSessions) {
                setSessions(JSON.parse(savedSessions));
            } else {
                setSessions([]); // Ensures page loads even without data
            }
        };
        loadSessions();
    }, []);

    // Format the date from ISO string to a readable format
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Run Log</Text>
            <FlatList
                data={sessions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.sessionItem}>
                        <Text style={styles.text}>Steps: {item.steps}</Text>
                        <Text style={styles.text}>Duration: {item.duration}</Text>
                        <Text style={styles.text}>Completed At: {formatDate(item.timestamp)}</Text>
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
});

export default Log;
