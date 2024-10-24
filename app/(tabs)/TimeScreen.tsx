import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(null);
  const intervalRef = useRef(null);

  // Store the pedometer subscription
  const pedometerSubscription = useRef(null);

  useEffect(() => {
    if (isRunning) {
      // Start the timer
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Start counting steps
      startStepCounting();
    } else {
      // Stop the timer
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop counting steps
      stopStepCounting();
    }

    // Cleanup when component unmounts
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      stopStepCounting();
    };
  }, [isRunning]);

  // Update minutes and hours
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

  // Start counting steps
  const startStepCounting = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(isAvailable);

    if (isAvailable) {
      pedometerSubscription.current = Pedometer.watchStepCount((result) => {
        setStepCount((prevStepCount) => prevStepCount + result.steps);
      });
    } else {
      console.log('Pedometer is not available on this device.');
    }
  };

  // Stop counting steps
  const stopStepCounting = () => {
    if (pedometerSubscription.current) {
      pedometerSubscription.current.remove();
      pedometerSubscription.current = null;
    }
  };

  // Toggle the timer
  const toggleTimer = () => setIsRunning((prev) => !prev);

  // Reset the timer and steps
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setMinutes(0);
    setHours(0);
    setStepCount(0);
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
          : `Steps: ${stepCount}`}
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
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
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
