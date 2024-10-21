import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timer | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => (prev + 1) % 60);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (seconds === 0 && isRunning) {
      setMinutes((prev) => (prev + 1) % 60);
    }
  }, [seconds, isRunning]);

  useEffect(() => {
    if (minutes === 0 && isRunning && seconds === 0) {
      setHours((prev) => prev + 1);
    }
  }, [minutes, seconds, isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>
        {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
      <TouchableOpacity onPress={toggleTimer} style={styles.button}>
        <Text style={styles.buttonText}>
          {isRunning ? 'Stop' : 'Start'}
        </Text>
      </TouchableOpacity>
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
