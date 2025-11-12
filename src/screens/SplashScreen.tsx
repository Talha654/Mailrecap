import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, hp } from '../constants/StyleGuide';
import { SCREENS } from '../navigation';
import { RootStackNavigationProp } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    navigation: RootStackNavigationProp<typeof SCREENS.SPLASH>;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {

        const unsubscribe = async () => {
            // const userId = await AsyncStorage.getItem('userId');
            // if (userId) {
            //     navigation.replace(SCREENS.HOME);
            // } else {
                navigation.replace(SCREENS.LOGIN);
            // }
        };
        unsubscribe();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Mailrecap</Text>
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: wp(12),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: hp(4),
    },
    loader: {
        marginTop: hp(2),
    },
});

export default SplashScreen;