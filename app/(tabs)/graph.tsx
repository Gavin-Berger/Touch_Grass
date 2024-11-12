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
  const isFocused = useIsFocused();

  useEffect(() => {
    // Function to load data from AsyncStorage
    const loadSessionsAndGoal = async () => {
      try {
        const savedSessions = await AsyncStorage.getItem('sessions');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions);
          setSessions(parsedSessions);
          calculateAverageSteps(parsedSessions);
        } else {
          setSessions([]);
        }

        const savedGoal = await AsyncStorage.getItem('goal');
        if (savedGoal) {
          const parsedGoal = JSON.parse(savedGoal).steps;
          const validGoal = Number.isFinite(parsedGoal) ? parsedGoal : 0;
          setGoal(validGoal);
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

  const stepData = sessions
    .map(session => (Number.isFinite(session.steps) && session.steps > 0 ? session.steps : null))
    .filter(value => value !== null);

  const chartData = stepData.length > 0 ? stepData : [0];

  const labels = sessions
    .map(session => new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    .filter((_, index) => index % 2 === 0);

  // Set interval to fetch or update data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Placeholder for data fetch or update logic
      console.log("Updating chart data...");
    }, 10000); // Updates every 10 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.infoPanelTop}>
        <Text style={styles.infoText}>Average Steps: {averageSteps}</Text>
        <Text style={styles.infoText}>Goal: {goal} steps</Text>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: chartData,
                color: (opacity = 1) => `rgba(0, 153, 51, ${opacity})`,
              },
              ...(goal !== null ? [{
                data: Array(chartData.length).fill(goal),
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                withDots: false,
              }] : []),
            ],
          }}
          width={screenWidth - 32} // Responsive width
          height={220}
          chartConfig={{
            ...chartConfig,
            propsForBackgroundLines: {
              strokeDasharray: "0",
              strokeWidth: 1,
            },
          }}
          style={styles.chartStyle}
          onDataPointClick={(data) => {
            Alert.alert(`Step count on ${labels[data.index]}: ${data.value}`);
          }}
        />
      </View>

      <View style={styles.infoPanelBottom}>
        <Text style={styles.infoText}>Date Range: Nov 6 - Nov 12</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#D4EDDA',
    fontWeight: 'bold',
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
