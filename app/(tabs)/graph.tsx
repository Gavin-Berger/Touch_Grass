import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ScaledSize } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';

const Graph = () => {
  const [sessions, setSessions] = useState<{ steps: number; duration: string; timestamp: string }[]>([]);
  const [averageSteps, setAverageSteps] = useState<number | null>(null);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState<number>(0);
  const isFocused = useIsFocused();
  const caloriesPerStep = 0.04; // Estimated calories burned per step

  const loadSessionsAndGoal = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('sessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        calculateAverageSteps(parsedSessions);
        calculateTotalCalories(parsedSessions);
        calculateTotalSteps(parsedSessions);
      } else {
        setSessions([]);
      }

      const savedGoal = await AsyncStorage.getItem('goal');
      if (savedGoal) {
        const parsedGoal = JSON.parse(savedGoal).steps;
        setGoal(Number.isFinite(parsedGoal) ? parsedGoal : 0);
      } else {
        setGoal(0);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSessionsAndGoal();
    }
  }, [isFocused]);

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => setScreenWidth(window.width);
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  const calculateAverageSteps = (sessionsData: any[]) => {
    const totalSteps = sessionsData.reduce((sum: any, session: { steps: any }) => sum + (session.steps || 0), 0);
    setAverageSteps(sessionsData.length > 0 ? Math.round(totalSteps / sessionsData.length) : 0);
  };

  const calculateTotalCalories = (sessionsData: any[]) => {
    const total = sessionsData.reduce((sum: number, session: { steps: any }) => sum + (session.steps || 0) * caloriesPerStep, 0);
    setTotalCaloriesBurned(total);
  };

  const calculateTotalSteps = (sessionsData: any[]) => {
    const total = sessionsData.reduce((sum: any, session: { steps: any }) => sum + (session.steps || 0), 0);
    setTotalSteps(total);
  };

  // Group sessions by unique dates
  const groupedData: { [key: string]: { steps: number } } = sessions.reduce((acc: { [key: string]: { steps: number } }, session) => {
    const date = new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = { steps: 0 };
    }
    acc[date].steps += session.steps || 0;
    return acc;
  }, {});

  // Extract labels and aggregated step data
  const labels = Object.keys(groupedData); // Unique dates for x-axis
  const stepData = Object.values(groupedData).map((data) => data.steps); // Aggregated steps
  const calorieChartData = stepData.map((steps) => steps * caloriesPerStep);

  const startDate = labels[0] || '';
  const endDate = labels[labels.length - 1] || '';

  return (
    <View style={styles.container}>
      {/* Insights Title */}
      <View style={styles.insightsTitleContainer}>
        <Text style={styles.insightsTitle}>Insights</Text>
      </View>

      {/* Steps Over Time Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: stepData.length > 0 ? stepData : [0],
                color: (opacity = 1) => `rgba(0, 153, 51, ${opacity})`,
              },
              ...(goal !== null
                ? [
                    {
                      data: Array(stepData.length).fill(goal),
                      color: () => `rgba(255, 215, 0, 0.8)`,
                      withDots: false,
                    },
                  ]
                : []),
            ],
          }}
          width={screenWidth - 48}
          height={200}
          chartConfig={chartConfig}
          style={styles.chartStyle}
        />
      </View>

      {/* Calories Burned Over Time Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: calorieChartData.length > 0 ? calorieChartData : [0],
                color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
              },
            ],
          }}
          width={screenWidth - 48}
          height={200}
          yAxisSuffix=" kcal"
          chartConfig={chartConfig}
          style={styles.chartStyle}
        />
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Total Steps</Text>
          <Text style={styles.summaryValue}>{totalSteps}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Calories Burned</Text>
          <Text style={styles.summaryValue}>{totalCaloriesBurned.toFixed(2)} kcal</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Average Steps</Text>
          <Text style={styles.summaryValue}>{averageSteps}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryTitle}>Sessions</Text>
          <Text style={styles.summaryValue}>{sessions.length}</Text>
        </View>
      </View>
    </View>
  );
};

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
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0B6E4F',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#D4EDDA',
    fontWeight: 'bold',
  },
  insightsTitleContainer: {
    backgroundColor: '#148F77',
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 18,
    color: '#D4EDDA',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#148F77',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginVertical: 12, // Adjust for more space
    width: '100%',
  },
  chartStyle: {
    borderRadius: 16,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4EDDA',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FCAE1E',
  },
});

export default Graph;
