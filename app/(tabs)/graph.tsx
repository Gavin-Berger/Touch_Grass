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
      console.error("Failed to load data:", error);
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
    const totalSteps = sessionsData.reduce((sum: any, session: { steps: any; }) => sum + (session.steps || 0), 0);
    setAverageSteps(sessionsData.length > 0 ? Math.round(totalSteps / sessionsData.length) : 0);
  };

  const calculateTotalCalories = (sessionsData: any[]) => {
    const total = sessionsData.reduce((sum: number, session: { steps: any; }) => sum + (session.steps || 0) * caloriesPerStep, 0);
    setTotalCaloriesBurned(total);
  };

  const calculateTotalSteps = (sessionsData: any[]) => {
    const total = sessionsData.reduce((sum: any, session: { steps: any; }) => sum + (session.steps || 0), 0);
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
  const stepData = Object.values(groupedData).map(data => data.steps); // Aggregated steps
  const calorieChartData = stepData.map(steps => steps * caloriesPerStep);

  const startDate = labels[0] || '';
  const endDate = labels[labels.length - 1] || '';

  return (
    <View style={styles.container}>
      <View style={styles.infoPanelTop}>
        <Text style={styles.infoText}>Total Steps: {totalSteps}</Text>
        <Text style={styles.infoText}>Average Steps: {averageSteps}</Text>
      </View>

      {/* Steps Over Time Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Steps Over Time</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: stepData.length > 0 ? stepData : [0],
                color: (opacity = 1) => `rgba(0, 153, 51, ${opacity})`,
              },
              ...(goal !== null ? [{
                data: Array(stepData.length).fill(goal),
                color: () => `rgba(255, 215, 0, 0.8)`,
                withDots: false,
              }] : []),
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chartStyle}
          onDataPointClick={(data) => {
            Alert.alert(`Step count on ${labels[data.index]}: ${data.value}`);
          }}
        />
      </View>

      {/* Calories Burned Over Time Chart */}
      <View style={[styles.chartContainer, { marginBottom: 20 }]}>
        <Text style={styles.chartTitle}>Calories Burned Over Time</Text>
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
          width={screenWidth - 32}
          height={240} // Slightly increased height for label space
          yAxisSuffix=" kcal"
          chartConfig={{
            ...chartConfig,
            decimalPlaces: 2,
          }}
          style={styles.chartStyle}
          fromZero={true}
          onDataPointClick={(data) => {
            Alert.alert(`Calories burned on ${labels[data.index]}: ${data.value.toFixed(2)} kcal`);
          }}
        />
      </View>

      {/* Total Calories Burned */}
      <View style={styles.totalCaloriesContainer}>
        <Text style={styles.totalCaloriesText}>Total Calories Burned: {totalCaloriesBurned.toFixed(2)} kcal</Text>
      </View>

      {/* Date Range and Total Sessions */}
      <View style={styles.infoPanelBottom}>
        <Text style={styles.infoText}>Date Range: {startDate} - {endDate}</Text>
        <Text style={styles.infoText}>Total Sessions: {sessions.length}</Text>
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
  propsForBackgroundLines: {
    strokeDasharray: "0",
    strokeWidth: 1,
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
  chartContainer: {
    backgroundColor: '#148F77',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginVertical: 10,
    width: '100%',
  },
  chartTitle: {
    color: '#D4EDDA',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  chartStyle: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  infoPanelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out each container
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10, // Adjust padding if needed
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginBottom: 10,
  },
  infoTextContainer: {
    flex: 1, // Each container takes up equal space
    alignItems: 'center',
  },
  totalCaloriesContainer: {
    backgroundColor: '#0B6E4F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  totalCaloriesText: {
    fontSize: 16,
    color: '#FCAE1E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoPanelBottom: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#D4EDDA',
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap', // Allows text to wrap if it’s too long
  },
});

export default Graph;