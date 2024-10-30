// app/(tabs)/log.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Log: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Log</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D0D0D',
    },
    text: {
        color: '#fff',
        fontSize: 24,
    },
});

export default Log;