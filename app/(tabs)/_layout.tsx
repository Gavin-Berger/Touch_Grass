import React from 'react';
import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Render the current tab page */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Static Tab Bar at the Bottom */}
      <View style={styles.tabBar}>
        <Link href="./index" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="home" size={24} color="#148F77" />
            <Text style={styles.tabText}>Home</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./log" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="list" size={24} color="#fff" />
            <Text style={styles.tabText}>Log</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./set-goal" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="flag" size={24} color="#fff" />
            <Text style={styles.tabText}>Set Goal</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./graph" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="bar-chart" size={24} color="#fff" />
            <Text style={styles.tabText}>Graph</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./about" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="info" size={24} color="#fff" />
            <Text style={styles.tabText}>About</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#333',
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
