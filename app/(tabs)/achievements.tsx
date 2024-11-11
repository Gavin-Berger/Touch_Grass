import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const achievementsList = [
    { id: '1', title: 'Touched Grass', description: 'Start and finish your first session' },
    { id: '2', title: 'Start of a Journey', description: 'Set your first goal' },
    // Add more achievements as needed
];

const Achievements: React.FC = () => {
    const [completedAchievements, setCompletedAchievements] = useState<string[]>([]);

    // Load completed achievements from AsyncStorage when the component mounts
    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const storedAchievements = await AsyncStorage.getItem('completedAchievements');
                if (storedAchievements) {
                    setCompletedAchievements(JSON.parse(storedAchievements));
                }
            } catch (error) {
                console.error('Failed to load achievements:', error);
            }
        };
        loadAchievements();
    }, []);

    // Check if an achievement is completed
    const isAchievementCompleted = (id: string) => completedAchievements.includes(id);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Achievements</Text>
            <FlatList
                data={achievementsList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.achievementItem}>
                        <Text
                            style={[
                                styles.title,
                                isAchievementCompleted(item.id) ? styles.completedText : styles.incompleteText
                            ]}
                        >
                            {item.title}
                        </Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
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
    achievementItem: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#232323',
    },
    title: {
        fontSize: 18,
    },
    description: {
        color: '#ccc',
        fontSize: 14,
    },
    completedText: {
        color: '#32CD32', // Bright green for completed achievements
    },
    incompleteText: {
        color: 'gray', // Gray for incomplete achievements
    },
});

export default Achievements;
