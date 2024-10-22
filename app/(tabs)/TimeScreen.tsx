import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timer | null>(null); // Store interval ID

  // Start or stop the timer based on `isRunning`
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [isRunning]);

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

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setMinutes(0);
    setHours(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>
        {`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
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
