import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackNavigationProp } from '../types/navigation';
import { SCREENS } from '../navigation/screens';

type ProfileScreenNavigationProp = RootStackNavigationProp<typeof SCREENS.PROFILE>;

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <Text style={styles.subtitle}>Manage your profile information</Text>

            <View style={styles.profileInfo}>
                <Text style={styles.infoText}>Name: John Doe</Text>
                <Text style={styles.infoText}>Email: john.doe@example.com</Text>
                <Text style={styles.infoText}>Member since: January 2024</Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate(SCREENS.HOME)}
            >
                <Text style={styles.buttonText}>{t('common.back')} to {t('home.title')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate(SCREENS.SETTINGS)}
            >
                <Text style={styles.buttonText}>Go to {t('settings.title')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        color: '#666',
        textAlign: 'center',
    },
    profileInfo: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '90%',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
