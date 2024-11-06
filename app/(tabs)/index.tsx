import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
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
      {/* Background Jungle Layers */}
      <Svg height="100%" width="100%" style={styles.svgContainer}>
        <Circle cx="20%" cy="30%" r="150" fill="rgba(34, 139, 34, 0.3)" />
        <Circle cx="80%" cy="40%" r="120" fill="rgba(0, 128, 0, 0.2)" />
        <Circle cx="50%" cy="80%" r="180" fill="rgba(34, 139, 34, 0.2)" />
        <Circle cx="30%" cy="60%" r="90" fill="rgba(85, 107, 47, 0.25)" />
      </Svg>

      {/* Centered "Touch Grass" Text with Animated Icon */}
      <Link href="./run" asChild>
        <TouchableOpacity style={styles.centeredContainer}>
          <Text style={styles.text}>Touch Grass</Text>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
            <MaterialIcons name="grass" size={240} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </Link>

      {/* Buttons Linking to Different Sections */}
      <View style={styles.buttonContainer}>
        <Link href="./log" asChild>
          <TouchableOpacity style={styles.button}>
            <MaterialIcons name="list" size={24} color="#fff" />
            <Text style={styles.buttonText}>Log</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./graph" asChild>
          <TouchableOpacity style={styles.button}>
            <MaterialIcons name="bar-chart" size={24} color="#fff" />
            <Text style={styles.buttonText}>Graph</Text>
          </TouchableOpacity>
        </Link>

        {/* Added Set Goal button for goal setting feature */}
        <Link href="./set-goal" asChild> {/* Corrected path to use './set-goal' */}
          <TouchableOpacity style={styles.button}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}> {/* Wrap contents in a View */}
              <MaterialIcons name="flag" size={24} color="#fff" />
              <Text style={styles.buttonText}>Set Goal</Text>
            </View>
          </TouchableOpacity>
        </Link>


        <Link href="./about" asChild>
          <TouchableOpacity style={styles.button}>
            <MaterialIcons name="info" size={24} color="#fff" />
            <Text style={styles.buttonText}>About</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Static Tab Bar at the Bottom */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="home" size={24} color="#148F77" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="search" size={24} color="#fff" />
          <Text style={styles.tabText}>Log</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="settings" size={24} color="#fff" />
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C40',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  text: {
    color: '#D4EDDA',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginVertical: 20,
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#0D0D0D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

