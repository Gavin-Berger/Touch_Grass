import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from './Notification';

const SetGoal: React.FC = () => {
  const [goalSteps, setGoalSteps] = useState('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const loadSavedGoal = async () => {
      try {
        const savedGoal = await AsyncStorage.getItem('goal');
        if (savedGoal) {
          const { steps } = JSON.parse(savedGoal);
          setGoalSteps(steps.toString());
          calculateProgress(steps);
        }
      } catch (error) {
        console.error('Failed to load goal:', error);
      }
    };
    loadSavedGoal();
  }, []);

  const calculateProgress = async (goal: number) => {
    const savedSessions = await AsyncStorage.getItem('sessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      const totalSteps = sessions.reduce((sum: number, session: any) => sum + session.steps, 0);
      setProgress(Math.min(totalSteps, goal)); // Cap progress at the goal value
    }
  };

  const handleSaveGoal = async () => {
    if (isNaN(parseInt(goalSteps))) {
      Alert.alert('Invalid Input', 'Please enter a valid numeric goal.');
      return;
    }

    const goalData = { steps: parseInt(goalSteps) };
    try {
      await AsyncStorage.setItem('goal', JSON.stringify(goalData));
      Alert.alert('Success', 'Goal saved successfully!');
      calculateProgress(parseInt(goalSteps));
      Keyboard.dismiss();
          // Update achievements for "Start of a Journey"
          const storedAchievements = await AsyncStorage.getItem('completedAchievements');
          const achievements = storedAchievements ? JSON.parse(storedAchievements) : [];
          if (!achievements.includes('2')) { // '2' is the ID for the "Start of a Journey" achievement
              achievements.push('2');
              await AsyncStorage.setItem('completedAchievements', JSON.stringify(achievements));
          }
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Set Your Step Goal</Text>
          <View style={styles.divider} />
        </View>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter step goal"
          placeholderTextColor="#8FA8B6"
          keyboardType="numeric"
          value={goalSteps}
          onChangeText={setGoalSteps}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSaveGoal}>
          <Text style={styles.buttonText}>Save Goal</Text>
        </TouchableOpacity>

        {/* Progress Display */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((progress / parseInt(goalSteps || '1')) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress} / {goalSteps || '0'} steps
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    color: '#D4EDDA',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    width: '60%',
    height: 2,
    backgroundColor: '#148F77',
    marginTop: 5,
  },
  input: {
    width: '80%',
    padding: 15,
    backgroundColor: '#2A474E',
    color: '#D4EDDA',
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#148F77',
  },
  button: {
    width: '80%',
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#D4EDDA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#2A474E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FCAE1E',
    borderRadius: 10,
  },
  progressText: {
    color: '#FCAE1E',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SetGoal;
