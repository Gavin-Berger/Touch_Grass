import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; // Import Toast for notifications

const achievementsList = [
    { id: '1', title: 'Touched Grass', description: 'Start and finish your first session' },
    { id: '2', title: 'Start of a Journey', description: 'Set your first goal' },
    // Add more achievements as needed
];

const Achievements: React.FC = () => {
    const [completedAchievements, setCompletedAchievements] = useState<string[]>([]);

    // Function to load completed achievements from AsyncStorage
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

    // Initial load and refresh achievements when the component mounts
    useEffect(() => {
        loadAchievements();

        // Listener to update achievements whenever they change
        const interval = setInterval(() => {
            loadAchievements();
        }, 1000); // Checks for updates every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Function to reset achievements
    const resetAchievements = async () => {
        Alert.alert(
            "Reset Achievements",
            "Are you sure you want to reset all achievements? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('completedAchievements');
                            setCompletedAchievements([]);
                            Toast.show({
                                type: 'success',
                                text1: 'Achievements reset!',
                                text2: 'All achievements have been cleared for testing.',
                                duration: 4000,
                            });
                        } catch (error) {
                            console.error('Failed to reset achievements:', error);
                        }
                    }
                }
            ]
        );
    };

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
            {/* Reset Achievements Button */}
            <View style={styles.resetButtonContainer}>
                <Button title="Reset Achievements" color="#FF6347" onPress={resetAchievements} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A3C40',
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
    resetButtonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
});

export default Achievements;
