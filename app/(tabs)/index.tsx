import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Touch Grass</Text>
      <View style={styles.iconContainer}>
        <MaterialIcons name="grass" size={240} color="#fff" />
      </View>
      <View style={styles.circle}>
        <TouchableOpacity
          style={[styles.button, styles.topButton]}
          onPress={() => router.push("/about")} // Navigate to About screen
        >
          <MaterialIcons name="directions-run" size={50} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.bottomButton]}
          onPress={() => router.push("/TimeScreen")} // Navigate to Timer screen
        >
          <MaterialIcons name="timer" size={50} color="#fff" />
        </TouchableOpacity>
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
    borderColor: '148F77',
    borderWidth: 2,
    marginTop: 10,
    marginBottom: 50,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButton: {
    backgroundColor: '#1E90FF',
  },
  bottomButton: {
    backgroundColor: '#148F77',
  },
});