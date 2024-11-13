import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ScaledSize } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';

const Graph = () => {
  const [sessions, setSessions] = useState<{ steps: number; duration: string; timestamp: string }[]>([]);
  const [averageSteps, setAverageSteps] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0); // Track total calories burned
  const [dateRange, setDateRange] = useState<string>(""); // Track dynamic date range
  const isFocused = useIsFocused();
  const caloriesPerStep = 0.04; // Estimate calories burned per step

  useEffect(() => {
    const loadSessionsAndGoal = async () => {
      try {
        const savedSessions = await AsyncStorage.getItem('sessions');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions);
          setSessions(parsedSessions);
          calculateAverageSteps(parsedSessions);
          calculateTotalCalories(parsedSessions);
          updateDateRange(parsedSessions);
        } else {
          setSessions([]);
          setDateRange("No data available");
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

    if (isFocused) {
      loadSessionsAndGoal();
    }
  }, [isFocused]);

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => setScreenWidth(window.width);
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  const calculateAverageSteps = (sessionsData: { steps: number; duration: string; timestamp: string }[]) => {
    if (sessionsData.length === 0) {
      setAverageSteps(0);
      return;
    }
    const totalSteps = sessionsData.reduce((sum, session) => sum + session.steps, 0);
    const average = totalSteps / sessionsData.length;
    setAverageSteps(Number.isFinite(average) ? Math.round(average) : 0);
  };

  const calculateTotalCalories = (sessionsData: { steps: number; duration: string; timestamp: string }[]) => {
    const totalCalories = sessionsData.reduce((sum, session) => sum + (session.steps * caloriesPerStep), 0);
    setTotalCaloriesBurned(totalCalories);
  };

  const updateDateRange = (sessionsData: { timestamp: string }[]) => {
    if (sessionsData.length === 0) return;
    const timestamps = sessionsData.map(session => new Date(session.timestamp));
    const minDate = new Date(Math.min(...timestamps.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...timestamps.map(date => date.getTime())));
    setDateRange(`${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);
  };

  const stepData = sessions
    .map(session => (Number.isFinite(session.steps) && session.steps > 0 ? session.steps : null))
    .filter(value => value !== null);

  const chartData = stepData.length > 0 ? stepData : [0];

  const caloriesData = stepData.map(steps => steps * caloriesPerStep);

  const labels = sessions
    .map(session => new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    .filter((_, index) => index % 2 === 0);

  return (
    <View style={styles.container}>
      {/* Average Steps and Goal Info */}
      <View style={styles.infoPanelTop}>
        <Text style={styles.infoText}>Average Steps: {averageSteps}</Text>
        <Text style={styles.infoText}>Goal: {goal} steps</Text>
      </View>

      {/* Steps Line Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Steps Over Time</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: chartData,
                color: () => `rgb(0, 153, 51)`,
              },
              ...(goal !== null ? [{
                data: Array(chartData.length).fill(goal),
                color: () => `rgb(255, 215, 0)`,
                withDots: false,
              }] : []),
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...chartConfig,
            propsForLabels: {
              rotation: 45,
              fontSize: 10,
            },
          }}
          style={styles.chartStyle}
          onDataPointClick={(data) => {
            Alert.alert(`Step count on ${labels[data.index]}: ${data.value}`);
          }}
        />
      </View>

      {/* Calories Burned Line Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Calories Burned Over Time</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: caloriesData.length > 0 ? caloriesData : [0],
                color: () => `rgb(255, 99, 132)`, // Change color for calories burned chart
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...chartConfig,
            propsForLabels: {
              rotation: 45,
              fontSize: 10,
            },
          }}
          style={styles.chartStyle}
          onDataPointClick={(data) => {
            Alert.alert(`Calories burned on ${labels[data.index]}: ${data.value.toFixed(2)}`);
          }}
        />
      </View>

      {/* Display Total Calories Burned */}
      <View style={styles.totalCaloriesContainer}>
        <Text style={styles.totalCaloriesText}>Total Calories Burned: {totalCaloriesBurned.toFixed(2)} kcal</Text>
      </View>

      {/* Display Dynamic Date Range */}
      <View style={styles.infoPanelBottom}>
        <Text style={styles.infoText}>Date Range: {dateRange}</Text>
        <Text style={styles.infoText}>Total Sessions: {sessions.length}</Text>
      </View>
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
    marginVertical: 16,
  },
  chartTitle: {
    color: '#D4EDDA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  infoPanelTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginBottom: 10,
  },
  infoPanelBottom: {
    flexDirection: 'column', // Stack Date Range and Total Sessions vertically
    alignItems: 'center', // Center align the text
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginTop: 10,
  },
  totalCaloriesContainer: {
    backgroundColor: '#0B6E4F',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  totalCaloriesText: {
    fontSize: 16,
    color: '#FCAE1E',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14, // Reduced font size for better fit
    color: '#D4EDDA',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    color: '#D4EDDA',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default Graph;
