import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { wp, hp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import i18n from '../i18n';
import { SCREENS } from '../navigation/screens';
import { CustomButton } from '../components/ui/CustomButton';
import { NavigationProp } from '../types/navigation';

type Language = 'en' | 'es' | 'ht';

export const LanguageSelectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const languages = [
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
        { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
        { code: 'ht' as Language, name: 'Kreyòl', flag: '🇭🇹' },
    ];

    const changeLanguage = async (languageCode: string) => {
        try {
            await i18n.changeLanguage(languageCode);
            // Navigate to home screen after language selection
            navigation.navigate(SCREENS.PRIVACY_TERMS);
        } catch (error) {
            console.log('Error changing language:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>🌍</Text>
                            </View>
                            <Text style={styles.title}>Choose Your Language</Text>
                            <Text style={styles.subtitle}>Select your preferred language</Text>
                        </View>

                        <View style={styles.languageContainer}>
                            {languages.map((language) => (
                                <CustomButton
                                    key={language.code}
                                    title={`${language.flag} ${language.name}`}
                                    onPress={() => changeLanguage(language.code)}
                                    style={{ paddingVertical: hp(1), borderRadius: wp(4) }}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    card: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: wp(6),
        padding: wp(8),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: hp(2),
        },
        shadowOpacity: 0.25,
        shadowRadius: wp(4),
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: hp(6),
    },
    iconContainer: {
        width: wp(16),
        height: wp(16),
        backgroundColor: '#B25FFF',
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    icon: {
        fontSize: wp(6),
    },
    title: {
        fontSize: wp(7.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(1),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(4.5),
        color: '#4A5565',
        textAlign: 'center',
    },
    languageContainer: {
        gap: hp(2),
    },
    languageButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: hp(2.5),
        paddingHorizontal: wp(6),
        borderRadius: wp(4),
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: {
            width: 0,
            height: hp(1),
        },
        shadowOpacity: 0.3,
        shadowRadius: wp(2),
        elevation: 4,
    },
    languageText: {
        color: '#FFFFFF',
        fontSize: wp(5),
        fontWeight: 'bold',
    },
});