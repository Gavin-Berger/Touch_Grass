import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function Graph() {
  const [sessions, setSessions] = useState<{ steps: number; duration: string; timestamp: string }[]>([]);
  const [averageSteps, setAverageSteps] = useState<number | null>(null); // Track average steps
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const savedSessions = await AsyncStorage.getItem('sessions');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions);
          setSessions(parsedSessions);
          calculateAverageSteps(parsedSessions); // Calculate average steps on load
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    if (isFocused) {
      loadSessions();
    }
  }, [isFocused]);

  // Function to calculate the average steps
  const calculateAverageSteps = (sessionsData: { steps: number; duration: string; timestamp: string }[]) => {
    const totalSteps = sessionsData.reduce((sum, session) => sum + session.steps, 0);
    const average = sessionsData.length > 0 ? totalSteps / sessionsData.length : 0;
    setAverageSteps(Math.round(average));
  };

  const stepData = sessions.map(session => session.steps);
  const labels = sessions
    .map(session => new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    .filter((_, index) => index % 2 === 0);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Steps Over Time</Text>
      {averageSteps !== null && (
        <Text style={styles.averageText}>Average Steps Per Session: {averageSteps}</Text>
      )}
      {stepData.length > 0 ? (
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: stepData,
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chartStyle}
        />
      ) : (
        <Text style={styles.emptyText}>No data available</Text>
      )}
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#1A3C40',
  backgroundGradientFrom: '#1A3C40',
  backgroundGradientTo: '#148F77',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(212, 237, 218, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 8,
  },
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#FCAE1E',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    color: '#D4EDDA',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  averageText: {
    fontSize: 18,
    color: '#FCAE1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 8,
    marginVertical: 8,
  },
  emptyText: {
    color: '#D4EDDA',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

