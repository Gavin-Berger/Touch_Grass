import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close the menu automatically whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <View style={styles.container}>
      {/* Render the current tab page */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Floating Action Button and Vertical Menu */}
      <>
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={toggleMenu}
        >
          <MaterialIcons name={isMenuOpen ? 'close' : 'menu'} size={30} color="#fff" />
        </TouchableOpacity>

        {/* Vertical Menu Buttons below FAB */}
        {isMenuOpen && (
          <View style={styles.verticalMenu}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="home" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>

            <Link href="/log" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="list" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>

            <Link href="/set-goal" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="flag" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>

            <Link href="/graph" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="bar-chart" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>

            <Link href="/achievements" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="emoji-events" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A3C40',
  },
  content: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    backgroundColor: '#148F77',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verticalMenu: {
    position: 'absolute',
    bottom: 120,
    right: 15,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#333',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
});
