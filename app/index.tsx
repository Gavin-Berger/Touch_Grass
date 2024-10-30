import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

export default function Index() {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Jungle-like animation effect
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
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

  return (
    <View style={styles.container}>
      {/* Jungle Layers */}
      <Svg height="100%" width="100%" style={styles.svgContainer}>
        <Circle cx="20%" cy="30%" r="150" fill="rgba(34, 139, 34, 0.3)" />
        <Circle cx="80%" cy="40%" r="120" fill="rgba(0, 128, 0, 0.2)" />
        <Circle cx="50%" cy="80%" r="180" fill="rgba(34, 139, 34, 0.2)" />
        <Circle cx="30%" cy="60%" r="90" fill="rgba(85, 107, 47, 0.25)" />
      </Svg>

      <Text style={styles.text}>Touch Grass</Text>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <MaterialIcons name="grass" size={240} color="#fff" />
      </Animated.View>
      
      <View style={styles.circle}>
        <View style={styles.halfTop}>
          <Link href="/run" asChild>
            <TouchableOpacity style={styles.button}>
              <LinearGradient
                colors={['#1E90FF', '#148F77']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="directions-run" size={50} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.halfBottom}>
          <TouchableOpacity style={styles.button}>
            <LinearGradient
              colors={['#148F77', '#1E90FF']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="timer" size={50} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40', // Base green color
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  text: {
    color: '#D4EDDA',
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 3,
    marginTop: 20,
  },
  iconContainer: {
    marginVertical: 20,
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    borderColor: '#333',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  halfTop: {
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfBottom: {
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});