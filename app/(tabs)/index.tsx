import { Text, View, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Touch Grass</Text>
      <View style={styles.iconContainer}>
        <MaterialIcons name="grass" size={240} color="#fff" />
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
});