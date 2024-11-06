import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function Graph() {
  const [sessions, setSessions] = useState<{ steps: number; duration: string; timestamp: string }[]>([]);
  const isFocused = useIsFocused(); // Check if the screen is focused

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const savedSessions = await AsyncStorage.getItem('sessions');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    if (isFocused) {
      loadSessions();
    }
  }, [isFocused]); // Re-run this effect when the screen gains focus

  const stepData = sessions.map(session => session.steps);
  const labels = sessions.map(session => new Date(session.timestamp).toLocaleDateString());

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Steps Over Time</Text>
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