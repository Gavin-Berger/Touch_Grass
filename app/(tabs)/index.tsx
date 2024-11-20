import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Corrected import
import { Link } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


function Index() {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

const checkForNewAchievements = async () => {
  try {
    const storedAchievements = await AsyncStorage.getItem('completedAchievements');
    const achievements = storedAchievements ? JSON.parse(storedAchievements) : [];
    const shownAchievements = await AsyncStorage.getItem('shownAchievements');
    const alreadyShown = shownAchievements ? JSON.parse(shownAchievements) : [];

    // Filter new achievements that haven't been shown
    const newAchievements = achievements.filter((id: string) => !alreadyShown.includes(id));

    if (newAchievements.length > 0) {
      for (const achievementId of newAchievements) {
        const achievementData = getAchievementData(achievementId);

        if (achievementData) {
          // Show toast for the new achievement
          Toast.show({
            type: 'success',
            text1: 'Achievement Unlocked!',
            text2: achievementData.title,
            duration: 5000, // Duration for the toast
          });

          // Add this achievement to the shown list
          alreadyShown.push(achievementId);
        }
      }

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('shownAchievements', JSON.stringify(alreadyShown));
    }
  } catch (error) {
    console.error('Failed to check for new achievements:', error);
  }
};

  return (
    <>
      <View style={styles.container}>
        <Svg height="100%" width="100%" style={styles.svgContainer}>
          <Circle cx="20%" cy="30%" r="160" fill="rgba(34, 139, 34, 0.3)" />
          <Circle cx="80%" cy="40%" r="140" fill="rgba(0, 128, 0, 0.25)" />
          <Circle cx="50%" cy="85%" r="200" fill="rgba(34, 139, 34, 0.2)" />
          <Circle cx="30%" cy="60%" r="100" fill="rgba(85, 107, 47, 0.3)" />
        </Svg>

        <Link href="/run" asChild>
          <TouchableOpacity style={styles.centeredContainer}>
            <Text style={styles.mainText}>Touch Grass</Text>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
              <MaterialIcons name="grass" size={240} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </Link>
      </View>

      <Toast />
    </>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  mainText: {
    color: '#D4EDDA',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  iconContainer: {
    marginVertical: 20,
  },
});
