import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Graph() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Over Time</Text>
      <LineChart
        data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              data: [20, 45, 28, 80, 99, 43],
            },
          ],
        }}
        width={Dimensions.get('window').width - 40} // from react-native
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#1A3C40',
          backgroundGradientFrom: '#1A3C40',
          backgroundGradientTo: '#148F77',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(212, 237, 218, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(212, 237, 218, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#0D0D0D',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#D4EDDA',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});