import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; // Import Toast

const SetGoal: React.FC = () => {
    const [goalSteps, setGoalSteps] = useState('');
    const [timeFrame, setTimeFrame] = useState('daily'); // Only 'daily' is used now
    const [progress, setProgress] = useState<number>(0);

    // Load saved goal on component mount
    useEffect(() => {
        const loadSavedGoal = async () => {
            try {
                const savedGoal = await AsyncStorage.getItem('goal');
                if (savedGoal) {
                    const { steps, timeFrame } = JSON.parse(savedGoal);
                    setGoalSteps(steps.toString());
                    setTimeFrame(timeFrame);
                }
                calculateProgress(timeFrame); // Calculate progress based on the loaded time frame
            } catch (error) {
                console.error("Failed to load goal:", error);
            }
        };
        loadSavedGoal();
    }, []);

    // Calculate progress based on session logs and selected time frame
    const calculateProgress = async (frame: string) => {
        const savedSessions = await AsyncStorage.getItem('sessions');
        if (savedSessions) {
            const sessions = JSON.parse(savedSessions);
            const now = new Date();
            const goalEndDate = new Date();

            if (frame === 'daily') goalEndDate.setDate(now.getDate() - 1);

            const stepsInTimeFrame = sessions.reduce((total: number, session: any) => {
                const sessionDate = new Date(session.timestamp);
                if (sessionDate >= goalEndDate) {
                    return total + session.steps;
                }
                return total;
            }, 0);

            setProgress(stepsInTimeFrame);
        }
    };

    // Update progress when the time frame changes
    useEffect(() => {
        calculateProgress(timeFrame);
    }, [timeFrame]);

    const handleSaveGoal = async () => {
        if (isNaN(parseInt(goalSteps))) {
            alert('Please enter a valid numeric goal.');
            return;
        }
        const goalData = { steps: parseInt(goalSteps), timeFrame };
        try {
            await AsyncStorage.setItem('goal', JSON.stringify(goalData));
            alert('Goal saved successfully!'); // Keep this alert for saving the goal

            calculateProgress(timeFrame); // Update progress after saving

            // Update achievements for "Start of a Journey"
            const storedAchievements = await AsyncStorage.getItem('completedAchievements');
            const achievements = storedAchievements ? JSON.parse(storedAchievements) : [];
            if (!achievements.includes('2')) { // '2' is the ID for the "Start of a Journey" achievement
                achievements.push('2');
                await AsyncStorage.setItem('completedAchievements', JSON.stringify(achievements));
                Toast.show({
                    type: 'success',
                    text1: 'Achievement Unlocked!',
                    text2: 'Start of a Journey',
                    duration: 3000, // Customize duration if needed
                });
            }
        } catch (error) {
            console.error("Failed to save goal:", error);
        }
        Keyboard.dismiss(); // Dismiss the keyboard after saving
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <Text style={styles.heading}>Set a Step Goal</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter step goal"
                    keyboardType="numeric"
                    value={goalSteps}
                    onChangeText={setGoalSteps}
                />

                {/* Only 'Daily' button remains */}
                <View style={styles.timeFrameContainer}>
                    <TouchableOpacity
                        style={[styles.timeFrameButton, timeFrame === 'daily' && styles.selectedTimeFrame]}
                        onPress={() => setTimeFrame('daily')}
                    >
                        <Text style={styles.timeFrameText}>Daily</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveGoal}>
                    <Text style={styles.buttonText}>Save Goal</Text>
                </TouchableOpacity>
                <Text style={styles.progressText}>
                    Progress: {progress} / {goalSteps || '0'} steps
                </Text>
                <Toast ref={(ref) => Toast.setRef(ref)} /> {/* Initialize Toast */}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A3C40',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        color: '#D4EDDA',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        padding: 10,
        backgroundColor: '#232323',
        color: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },
    timeFrameContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeFrameButton: {
        backgroundColor: '#148F77',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    selectedTimeFrame: {
        backgroundColor: '#1E90FF',
    },
    timeFrameText: {
        color: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#148F77',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    progressText: {
        color: '#D4EDDA',
        fontSize: 18,
        marginTop: 20,
    },
});

export default SetGoal;
