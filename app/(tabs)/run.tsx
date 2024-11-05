import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, Button } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const App: React.FC = () => {
    const [steps, setSteps] = useState<number>(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
    const [isCounting, setIsCounting] = useState<boolean>(false);
    const [sessionLog, setSessionLog] = useState<number[]>([]);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);
    const [seconds, setSeconds] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const router = useRouter();
    const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0});
    const [manualSteps, setManualSteps] = useState<number>(0);
    const [pedometerSubscription, setPedometerSubscription] = useState<any>(null);

    interface StepSubscription {
        remove: () => void;
    }

    useEffect(() => {
        let pedometerSubscription: any = null;
        let accelerometerSubscription: any = null;

        //Making sure that device app is loaded on has a pedometer
        const checkPedometerAvailability = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(isAvailable);
            if (!isAvailable) {
                console.error('Pedometer is not available.');
            }
        };

        //Getting necessary permissions from user
        const getPermissions = async () => {
            if (Platform.OS === 'ios') {
                const { granted } = await Pedometer.requestPermissionsAsync();
                if (!granted) {
                    console.error('Permission to access pedometer not granted.');
                    return;
                }
            } else if (Platform.OS === 'android') {
                const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                if (locationStatus !== 'granted') {
                    console.error('Necessary permissions were not granted.');
                    return;
                }
            }
        };

        interface PedometerResult {
            steps: number;
        }

        const startPedometerTracking = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(isAvailable);

            if(isAvailable) {
                const subscription = Pedometer.watchStepCount((result: PedometerResult) => {
                    if (isCounting && !isPaused) {
                        setSteps(result.steps + manualSteps);
                        setManualSteps(0);
                    }
                });
                setPedometerSubscription(subscription);
            }
        };

        const startAccelerometerTracking = () => {
            accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
                setAccelerometerData(accelerometerData);
                if (isCounting) {
                    detectExtraStep(accelerometerData);
                }
            });
            Accelerometer.setUpdateInterval(50);
        };

        //Logic to detect extra steps using accelerometer
        const detectExtraStep = (data: { x: number; y: number; z: number }) => {
            const acceleration = Math.sqrt(data.x * data.x + data.y + data.z * data.z);
            const stepThreshold = 1.2;

            if (acceleration > stepThreshold) {
                setManualSteps(prevSteps => prevSteps + 1);
            }
        };

        checkPedometerAvailability();
        getPermissions();
        startPedometerTracking();
        startAccelerometerTracking();
        handleStart();

        return () => {
            if (pedometerSubscription) pedometerSubscription.remove();
            if (accelerometerSubscription) accelerometerSubscription.remove();
        };
    }, [isCounting]);

    // Timer logic
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
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleStop = () => {
        setSessionLog([...sessionLog, steps]);
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
            <Text style={styles.timer}>
                {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
                    .toString()
                    .padStart(2, '0')}`}
            </Text>
            <View style={styles.buttonContainer}>
                {isPaused ? (
                    <TouchableOpacity style={styles.resumeButton} onPress={handleStart}>
                        <Text style={styles.buttonText}>Resume</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                        <Text style={styles.buttonText}>Pause</Text>
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
        backgroundColor: '#1A3C40', // Change this to your desired color
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    heading: {
        fontSize: 28,
        color: '#D4EDDA',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    steps: {
        fontSize: 22,
        color: '#148F77',
        marginBottom: 10,
    },
    timer: {
        fontSize: 30,
        color: '#FCAE1E',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        width: '100%',
    },
    stopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B0000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCAE1E',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    resumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#148F77',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default App;
