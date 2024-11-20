import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dimensions } from 'react-native';

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
    const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
    const [manualSteps, setManualSteps] = useState<number>(0);
    const [pedometerSubscription, setPedometerSubscription] = useState<any>(null);
    const bounce = useSharedValue(0);
    const timerPulse = useSharedValue(1);
    const horizontalPosition = useSharedValue(0);
    const screenWidth = Dimensions.get('window').width;
    const [isRunning, setIsRunning] = useState(false);
    useEffect(() => {
        const iconWidth = 100; // Width of your icon
        const maxTranslateX = (screenWidth - iconWidth) / 2; // Keep it within bounds

        horizontalPosition.value = withRepeat(
            withSequence(
                withTiming(maxTranslateX, { duration: 3000 }), // Move to the right
                withTiming(-maxTranslateX, { duration: 3000 }) // Move to the left
            ),
            -1, // Repeat infinitely
            true // Alternate direction
        );
    }, []);
    useEffect(() => {
        let pedometerSubscription: any = null;
        let accelerometerSubscription: any = null;

        // Making sure that device app is loaded on has a pedometer
        const checkPedometerAvailability = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(isAvailable);
            if (!isAvailable) {
                console.error('Pedometer is not available.');
            }
        };

        // Getting necessary permissions from user
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

            if (isAvailable) {
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
    useEffect(() => {
        bounce.value = withRepeat(withTiming(10, { duration: 1000 }), -1, true);
        timerPulse.value = withRepeat(withTiming(1.0, { duration: 1500 }), -1, true);
    }, []);


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: horizontalPosition.value }],
    }));

    const timerPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: timerPulse.value }],
    }));
    const handleStart = () => {
        setIsCounting(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleStop = async () => {
        const sessionData = {
            steps: steps, // Total steps recorded
            duration: `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            timestamp: new Date().toISOString(),
        };

        // Retrieve existing sessions from AsyncStorage
        try {
            const savedSessions = await AsyncStorage.getItem('sessions');
            const sessions = savedSessions ? JSON.parse(savedSessions) : [];
            sessions.push(sessionData);

            // Save updated sessions back to AsyncStorage
            await AsyncStorage.setItem('sessions', JSON.stringify(sessions));

            // Update achievements
            try {
                const storedAchievements = await AsyncStorage.getItem('completedAchievements');
                let completedAchievements = storedAchievements ? JSON.parse(storedAchievements) : [];

                if (!completedAchievements.includes('1')) {
                    completedAchievements.push('1'); // '1' is the ID of 'Touched Grass' achievement
                    await AsyncStorage.setItem('completedAchievements', JSON.stringify(completedAchievements));
                }
            } catch (error) {
                console.error('Failed to update achievements:', error);
            }
        } catch (error) {
            console.error('Error saving session:', error);
        }

        setIsCounting(false);
        setSteps(0);
        setStartTimestamp(null);
        setSeconds(0);
        setMinutes(0);
        setHours(0);
        router.push('/'); // Navigate back to the home page
    };

    return (
        <LinearGradient colors={['#1A3C40', '#148F77']} style={styles.container}>
            {/* Animated Runner Icon */}
            <Animated.View style={[styles.runningIcon, animatedStyle]}>
             <MaterialCommunityIcons name="run" size={100} color="#FCAE1E" />
                </Animated.View>

            {/* Step Counter */}
            <Text style={styles.heading}>Step Counter</Text>
            {isPedometerAvailable ? (
                <Text style={styles.steps}>Steps: {steps}</Text>
            ) : (
                <Text style={styles.steps}>Pedometer not available.</Text>
            )}

            {/* Timer with Animation */}
            <Animated.Text style={[styles.timer, timerPulseStyle]}>
                {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
                    .toString()
                    .padStart(2, '0')}`}
            </Animated.Text>

            {/* Buttons */}
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    runningIcon: {
        marginBottom: 20,
    },
    heading: {
        fontSize: 32,
        color: '#D4EDDA',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    steps: {
        fontSize: 24,
        color: '#32CD32',
        marginBottom: 15,
        fontWeight: '600',
    },
    timer: {
        fontSize: 36,
        color: '#FCAE1E',
        fontWeight: 'bold',
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        width: '90%',
    },
    stopButton: {
        backgroundColor: '#8B0000',
        padding: 12,
        borderRadius: 8,
    },
    pauseButton: {
        backgroundColor: '#FCAE1E',
        padding: 12,
        borderRadius: 8,
    },
    resumeButton: {
        backgroundColor: '#32CD32',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default App;
