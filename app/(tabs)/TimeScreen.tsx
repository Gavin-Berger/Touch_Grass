import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);
  const startTimestampRef = useRef<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pedometerSubscriptionRef = useRef<any>(null);

  const router = useRouter();

  // Request permissions on mount
  useEffect(() => {
    const getPermissions = async () => {
      if (Platform.OS === 'ios') {
        const { granted } = await Pedometer.requestPermissionsAsync();
        if (!granted) {
          console.error('Permission to access pedometer not granted.');
          return;
        }
      }
    };
    getPermissions();
  }, []);

  // Start or stop the timer and step counting
  useEffect(() => {
    if (isRunning) {
      // Start the timer
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      startTimestampRef.current = new Date();

      // Start step counting
      const startStepCounting = async () => {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        console.log('Pedometer available:', isAvailable);

        if (isAvailable) {
          if (Platform.OS === 'android') {
            // Use watchStepCount on Android
            pedometerSubscriptionRef.current = Pedometer.watchStepCount((result) => {
              console.log('Received steps:', result.steps);
              setSteps((prevSteps) => prevSteps + result.steps);
            });
          } else {
            // Use getStepCountAsync on iOS
            pedometerSubscriptionRef.current = setInterval(async () => {
              if (startTimestampRef.current) {
                try {
                  const result = await Pedometer.getStepCountAsync(
                    startTimestampRef.current,
                    new Date()
                  );
                  console.log('Received steps:', result.steps);
                  setSteps(result.steps || 0);
                } catch (error) {
                  console.error('Error getting step count:', error);
                }
              }
            }, 1000);
          }
        } else {
          console.error('Pedometer is not available on this device.');
        }
      };
      startStepCounting();
    } else {
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Stop step counting
      if (pedometerSubscriptionRef.current) {
        if (Platform.OS === 'android') {
          pedometerSubscriptionRef.current.remove();
        } else {
          clearInterval(pedometerSubscriptionRef.current);
        }
        pedometerSubscriptionRef.current = null;
      }
      startTimestampRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pedometerSubscriptionRef.current) {
        if (Platform.OS === 'android') {
          pedometerSubscriptionRef.current.remove();
        } else {
          clearInterval(pedometerSubscriptionRef.current);
        }
        pedometerSubscriptionRef.current = null;
      }
    };
  }, [isRunning]);

  // Handle minutes and hours incrementing
  useEffect(() => {
    if (seconds >= 60) {
      setSeconds(0);
      setMinutes((prev) => prev + 1);
    }
  }, [seconds]);

  useEffect(() => {
    if (minutes >= 60) {
      setMinutes(0);
      setHours((prev) => prev + 1);
    }
  }, [minutes]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setMinutes(0);
    setHours(0);
    setSteps(0);
    startTimestampRef.current = null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Touch Grass</Text>
      <Text style={styles.timeText}>
        {`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
      {isPedometerAvailable === false ? (
        <Text style={styles.steps}>Pedometer not available.</Text>
      ) : (
        <Text style={styles.steps}>Steps: {steps}</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleTimer} style={styles.button}>
          <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetTimer} style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    marginBottom: 20,
    color: '#148F77',
    fontWeight: 'bold',
  },
  timeText: {
    color: '#fff',
    fontSize: 48,
    marginBottom: 10,
  },
  steps: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#148F77',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
