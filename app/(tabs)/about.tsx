import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>This app was made by:</Text>
            <Text style={styles.name}>Gavin Berger</Text>
            <Text style={styles.name}>Trey Gaul</Text>
            <Text style={styles.name}>Edward Purser</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A3C40',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        marginTop: 5,
    }
});