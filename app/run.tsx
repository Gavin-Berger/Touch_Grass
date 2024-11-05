import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
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
    const inactivityThreshold = 1000;
    let lastStepTime = 0;
    const timeBuffer = 1000;
    const lowPassFactor = 1;

    let smoothedData = { x: 0, y: 0, z: 0 };
    let isStopped = false;

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
            Accelerometer.setUpdateInterval(500);
        };

        //Logic to detect extra steps using accelerometer
        const detectExtraStep = (data: { x: number; y: number; z: number }) => {
            const currentTime = Date.now();
            const stepThreshold = 44;

            smoothedData = {
                x: smoothedData.x + lowPassFactor * (data.x - smoothedData.x),
                y: smoothedData.y + lowPassFactor * (data.y - smoothedData.y),
                z: smoothedData.z + lowPassFactor * (data.z - smoothedData.z),
            };

            const acceleration = Math.sqrt(
                smoothedData.x * smoothedData.x + smoothedData.y * smoothedData.y + smoothedData.z * smoothedData.z
            );

            if (!isStopped && acceleration > stepThreshold && (currentTime - lastStepTime > timeBuffer)) {
                setManualSteps(manualSteps + 1);
                lastStepTime = currentTime;
            }

            if (acceleration < 1.2) {
                if (currentTime - lastStepTime > inactivityThreshold) {
                    isStopped = true;
                }
            } else {
                isStopped = false;
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
        setIsCounting(false);
    };

    const handleStop = () => {
        setSessionLog([...sessionLog, steps]);
        setIsCounting(false);
        setSteps(0);
        setManualSteps(0);
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
