import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Button } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

const App: React.FC = () => {
    const [steps, setSteps] = useState<number>(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
    const [isCounting, setIsCounting] = useState<boolean>(false);
    const [sessionLog, setSessionLog] = useState<number[]>([]);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);
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

    const handleStart = () => {
        setIsCounting(true);
        setIsPaused(false);
        setStartTimestamp(new Date());
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
                {isPaused && <Button title="Start" onPress={handleStart} />}
                <Button title="Pause" onPress={handlePause} />
                <Button title="Stop" onPress={handleStop} />
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
    },
});

export default App;