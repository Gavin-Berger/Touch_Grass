import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetGoal: React.FC = () => {
    const [goalSteps, setGoalSteps] = useState('');
    const [timeFrame, setTimeFrame] = useState(''); // Options like "daily", "weekly", "monthly"
    const [progress, setProgress] = useState<number>(0);

    // Load the progress based on session logs and selected time frame
    useEffect(() => {
        const calculateProgress = async () => {
            const savedSessions = await AsyncStorage.getItem('sessions');
            if (savedSessions) {
                const sessions = JSON.parse(savedSessions);
                const now = new Date();
                const goalEndDate = new Date();

                if (timeFrame === 'daily') goalEndDate.setDate(now.getDate() - 1);
                else if (timeFrame === 'weekly') goalEndDate.setDate(now.getDate() - 7);
                else if (timeFrame === 'monthly') goalEndDate.setMonth(now.getMonth() - 1);

                // Sum steps within the specified timeframe
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
        calculateProgress();
    }, [timeFrame]);

    // Save the goal to AsyncStorage for persistence
    const handleSaveGoal = async () => {
        const goalData = { steps: parseInt(goalSteps), timeFrame };
        await AsyncStorage.setItem('goal', JSON.stringify(goalData));
        alert('Goal saved successfully!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Set a Step Goal</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter step goal"
                keyboardType="numeric"
                value={goalSteps}
                onChangeText={setGoalSteps}
            />
            <TextInput
                style={styles.input}
                placeholder="Time frame (daily, weekly, monthly)"
                value={timeFrame}
                onChangeText={setTimeFrame}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveGoal}>
                <Text style={styles.buttonText}>Save Goal</Text>
            </TouchableOpacity>
            <Text style={styles.progressText}>
                Progress: {progress} / {goalSteps} steps
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
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
