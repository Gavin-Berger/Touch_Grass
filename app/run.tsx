import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Button, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const App: React.FC = () => {
    const [steps, setSteps] = useState<number>(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
    const [isCounting, setIsCounting] = useState<boolean>(false);
    const [sessionLog, setSessionLog] = useState<number[]>([]);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);
    const router = useRouter();

    interface StepSubscription {
        remove: () => void;
    }

    useEffect(() => {
        let subscription: StepSubscription | null = null;

        const checkPedometerAvailability = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(isAvailable);
            if (!isAvailable) {
                console.error('Pedometer is not available.');
            }
        };

        const getPermissions = async () => {
            if (Platform.OS === 'ios') {
                const { granted } = await Pedometer.requestPermissionsAsync();
                if (!granted) {
                    console.error('Permission to access pedometer not granted.');
                    return;
                }
            } else if (Platform.OS === 'android') {
                const { status: activityStatus } = await Location.requestForegroundPermissionsAsync();
                if (activityStatus !== 'granted') {
                    console.error('Permission to access background location not granted.');
                    return;
                }
            }
        };

        const startStepCounting = () => {
            subscription = Pedometer.watchStepCount(result => {
                if (isCounting) {
                    setSteps(result.steps || 0);
                }
            });
        };

        checkPedometerAvailability();
        getPermissions();
        startStepCounting();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [isCounting, startTimestamp]);

    const handleStart = () => {
        setIsCounting(true);
        setIsPaused(false);
        setSteps(0);
    };

    const handlePause = () => {
        setIsCounting(false);
        setIsPaused(true);
    };

    const handleStop = () => {
        setSessionLog([...sessionLog, steps]);
        setIsCounting(false);
        setSteps(0);
        setStartTimestamp(null);
        router.push('/');
    };

    useEffect(() => {
        if (!isCounting && !isPaused) {
            handleStart();
        }
    }, [isCounting]);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Step Counter</Text>
            {isPedometerAvailable ? (
                <Text style={styles.steps}>Steps: {steps}</Text>
            ) : (
                <Text style={styles.steps}>Pedometer not available.</Text>
            )}
            <View style={styles.buttonContainer}>
                {isPaused ? (
                    <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                        <Text style={styles.buttonText}>Pause</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.resumeButton} onPress={handleStart}>
                        <Text style={styles.buttonText}>Resume</Text>
                    </TouchableOpacity>
                )
            }
                <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                    <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
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