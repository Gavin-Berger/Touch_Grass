import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetGoal: React.FC = () => {
    const [goalSteps, setGoalSteps] = useState('');
    const [timeFrame, setTimeFrame] = useState('daily');
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
            else if (frame === 'weekly') goalEndDate.setDate(now.getDate() - 7);
            else if (frame === 'monthly') goalEndDate.setMonth(now.getMonth() - 1);

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

    // Save the goal to AsyncStorage
    const handleSaveGoal = async () => {
        if (isNaN(parseInt(goalSteps))) {
            alert('Please enter a valid numeric goal.');
            return;
        }
        const goalData = { steps: parseInt(goalSteps), timeFrame };
        try {
            await AsyncStorage.setItem('goal', JSON.stringify(goalData));
            alert('Goal saved successfully!');
            calculateProgress(timeFrame); // Update progress after saving
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
                
                <View style={styles.timeFrameContainer}>
                    <TouchableOpacity
                        style={[styles.timeFrameButton, timeFrame === 'daily' && styles.selectedTimeFrame]}
                        onPress={() => setTimeFrame('daily')}
                    >
                        <Text style={styles.timeFrameText}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeFrameButton, timeFrame === 'weekly' && styles.selectedTimeFrame]}
                        onPress={() => setTimeFrame('weekly')}
                    >
                        <Text style={styles.timeFrameText}>Weekly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeFrameButton, timeFrame === 'monthly' && styles.selectedTimeFrame]}
                        onPress={() => setTimeFrame('monthly')}
                    >
                        <Text style={styles.timeFrameText}>Monthly</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveGoal}>
                    <Text style={styles.buttonText}>Save Goal</Text>
                </TouchableOpacity>
                <Text style={styles.progressText}>
                    Progress: {progress} / {goalSteps || '0'} steps
                </Text>
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
