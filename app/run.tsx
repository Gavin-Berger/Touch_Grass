import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: React.FC = () => {
    const [steps, setSteps] = useState<number>(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
    const [isCounting, setIsCounting] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);
    const [seconds, setSeconds] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null;

        const getPermissions = async () => {
            if (Platform.OS === 'ios') {
                const { granted } = await Pedometer.requestPermissionsAsync();
                if (!granted) {
                    console.error('Permission to access pedometer not granted.');
                    return;
                }
            }
        };

        const startPollingSteps = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (!isAvailable) {
                console.error('Pedometer is not available on this device.');
                setIsPedometerAvailable(false);
                return;
            }
            setIsPedometerAvailable(true);

            pollingInterval = setInterval(async () => {
                if (isCounting) {
                    if (startTimestamp) {
                        const result = await Pedometer.getStepCountAsync(startTimestamp, new Date());
                        setSteps(result.steps || 0);
                    }
                }
            }, 500);
        };

        getPermissions();
        startPollingSteps();

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [isCounting, startTimestamp]);

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | null = null;

        if (isCounting && !isPaused) {
            timerInterval = setInterval(() => {
                setSeconds((prev) => {
                    if (prev === 59) {
                        setMinutes((m) => (m === 59 ? 0 : m + 1));
                        setHours((h) => (minutes === 59 && h < 23 ? h + 1 : h));
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else if (timerInterval) {
            clearInterval(timerInterval);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isCounting, isPaused, minutes]);

    const handleStart = () => {
        setIsCounting(true);
        setIsPaused(false);
        setStartTimestamp(new Date());
    };

    const handlePause = () => {
        setIsCounting(false);
        setIsPaused(true);
    };

    const handleStop = async () => {
        const endTime = new Date();
        const sessionData = {
            steps: steps,
            duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
                .toString()
                .padStart(2, '0')}`,
            timestamp: endTime.toISOString(),
        };

        const storedSessions = await AsyncStorage.getItem('sessions');
        const updatedSessions = storedSessions ? JSON.parse(storedSessions) : [];
        updatedSessions.push(sessionData);
        await AsyncStorage.setItem('sessions', JSON.stringify(updatedSessions));

        setIsCounting(false);
        setSteps(0);
        setStartTimestamp(null);
        setSeconds(0);
        setMinutes(0);
        setHours(0);
        router.push('/');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Step Counter</Text>
            {isPedometerAvailable ? (
                <Text style={styles.steps}>Steps: {steps}</Text>
            ) : (
                <Text style={styles.steps}>Pedometer not available.</Text>
            )}
            <Text style={styles.timer}>{`${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</Text>
            <View style={styles.buttonContainer}>
                {!isPaused ? (
                    <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                        <Text style={styles.buttonText}>Pause</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.resumeButton} onPress={handleStart}>
                        <Text style={styles.buttonText}>Resume</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                    <Text style={styles.buttonText}>Stop</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        marginBottom: 20,
        color: '#fff',
    },
    steps: {
        fontSize: 18,
        color: '#fff',
    },
    timer: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#8B0000',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    pauseButton: {
        backgroundColor: '#FCAE1E',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    resumeButton: {
        backgroundColor: '#148F77',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default App;
