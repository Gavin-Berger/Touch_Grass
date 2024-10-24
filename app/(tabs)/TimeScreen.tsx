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
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setStartTimestamp(new Date());

      // Start the timer
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Start polling steps
      const startPollingSteps = async () => {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          pollingIntervalRef.current = setInterval(async () => {
            if (startTimestamp) {
              const result = await Pedometer.getStepCountAsync(startTimestamp, new Date());
              setSteps(result.steps || 0);
            }
          }, 500);
        } else {
          console.error('Pedometer is not available on this device.');
        }
      };
      startPollingSteps();
    } else {
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Stop polling steps
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isRunning, startTimestamp]);

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
    setStartTimestamp(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Touch Grass</Text>
      <Text style={styles.timeText}>
        {`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
      {isPedometerAvailable ? (
        <Text style={styles.steps}>Steps: {steps}</Text>
      ) : (
        <Text style={styles.steps}>Pedometer not available.</Text>
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
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const startTimestampRef = useRef<Date | null>(null); // Use useRef instead of useState

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

      // Start polling steps
      const startPollingSteps = async () => {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          pollingIntervalRef.current = setInterval(async () => {
            if (startTimestampRef.current) {
              const result = await Pedometer.getStepCountAsync(
                startTimestampRef.current,
                new Date()
              );
              setSteps(result.steps || 0);
            }
          }, 500);
        } else {
          console.error('Pedometer is not available on this device.');
        }
      };
      startPollingSteps();
    } else {
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Stop polling steps
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isRunning]); // Depend only on isRunning

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
    if (!isRunning) {
      // Starting the timer
      startTimestampRef.current = new Date();
      setIsRunning(true);
    } else {
      // Stopping the timer
      setIsRunning(false);
      startTimestampRef.current = null;
    }
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
      {isPedometerAvailable ? (
        <Text style={styles.steps}>Steps: {steps}</Text>
      ) : (
        <Text style={styles.steps}>Pedometer not available.</Text>
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