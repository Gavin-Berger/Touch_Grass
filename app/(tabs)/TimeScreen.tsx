import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Permissions from 'expo-permissions';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermission(); // Request permission when component mounts
  }, []);

  const requestPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.ACTIVITY_RECOGNITION);
    setHasPermission(status === 'granted');
  };

  // Start or stop the timer based on `isRunning`
  useEffect(() => {
    if (isRunning && hasPermission) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      startStepCounting();
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      stopStepCounting();
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, hasPermission]);

  // Handle minutes and hours incrementing when needed
  useEffect(() => {
    if (seconds === 60) {
      setSeconds(0);
      setMinutes((prev) => prev + 1);
    }
  }, [seconds]);

  useEffect(() => {
    if (minutes === 60) {
      setMinutes(0);
      setHours((prev) => prev + 1);
    }
  }, [minutes]);

  // Function to toggle the timer on and off
  const toggleTimer = () => setIsRunning((prev) => !prev);

  // Function to reset the timer and steps
  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(0);
    setMinutes(0);
    setHours(0);
    setStepCount(0);
  };

  // Start counting steps using Pedometer
  const startStepCounting = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(isAvailable);

    if (isAvailable) {
      Pedometer.watchStepCount(result => {
        setStepCount(prevStepCount => prevStepCount + result.steps);
      });
    }
  };

  // Stop counting steps
  const stopStepCounting = () => {
    Pedometer.stopObserving(); // Stops pedometer updates
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>
        {`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
      <Text style={styles.stepText}>
        {isPedometerAvailable === false
          ? 'Pedometer not available'
          : hasPermission
          ? `Steps: ${stepCount}`
          : 'Permission not granted for activity tracking'}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleTimer} style={styles.button}>
          <Text style={styles.buttonText}>
            {isRunning ? 'Stop' : 'Start'}
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
  },
  timeText: {
    color: '#fff',
    fontSize: 48,
    marginBottom: 20,
  },
  stepText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  button: {
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
