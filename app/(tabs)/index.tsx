import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router';

export default function Index() {
  const handlePress = () => {

  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Touch Grass</Text>
      <View style={styles.iconContainer}>
        <MaterialIcons name="grass" size={240} color="#fff" />
      </View>
      <View style={styles.circle}>
        <View style={styles.halfTop}>
            <Link href="/run" asChild>
              <TouchableOpacity style={[styles.button, styles.topButton]}
              onPress={handlePress}>
                <MaterialIcons name="directions-run" size={50} color="#fff" />
              </TouchableOpacity>
            </Link>
          </View>
        <View style={styles.halfBottom}>
          <TouchableOpacity style={[styles.button, styles.bottomButton]}>
            <MaterialIcons name="timer" size={50} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 15,
    paddingBottom: 15,
  },
  text: {
    color: '#148F77',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      width: -3,
      height: 3,
    },
    textShadowRadius: 1,
  },
  iconContainer: {
    flex: 1,
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderColor: '#000000',
    borderWidth: 2,
    marginTop: 10,
    marginBottom: 50,
  },
  halfTop: {
    height: '50%',
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfBottom: {
    height: '50%',
    backgroundColor: '#148F77',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButton: {
    backgroundColor: '#1E90FF',
    height: '50%',
  },
  bottomButton: {
    backgroundColor: '#148F77',
    height: '50%',
  },
});