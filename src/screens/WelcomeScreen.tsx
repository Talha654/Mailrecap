import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../components/ui/CustomButton';
import { NavigationProp } from '../types/navigation';

export const WelcomeScreen: React.FC = () => {
    const { t } = useTranslation();

    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.root}
            >
                <View style={styles.card}>
                    {/* Illustration */}
                    <View style={styles.illustrationWrapper}>
                        <View style={styles.illustrationCircle}>
                            <View style={styles.illustrationIconWrapper}>
                                <Text style={styles.illustrationIcon}>📧</Text>
                            </View>
                        </View>
                    </View>
                    {/* Texts */}
                    <View style={styles.textBlock}>
                        <Text style={styles.title}>{t('welcome.title')}</Text>
                        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
                        <Text style={styles.description}>{t('welcome.description')}</Text>
                    </View>
                    {/* Button */}
                    {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(SCREENS.LANGUAGE_SELECTION)} activeOpacity={0.85}>
                        <Text style={styles.buttonText}>{t('welcome.getStarted')}</Text>
                    </TouchableOpacity> */}
                    <CustomButton
                        title={t('welcome.getStarted')}
                        onPress={() => navigation.navigate(SCREENS.LANGUAGE_SELECTION)}
                    />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(8),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.7) },
        shadowOpacity: 0.13,
        shadowRadius: wp(4),
        elevation: 8,
    },
    illustrationWrapper: {
        marginBottom: hp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationCircle: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        backgroundColor: '#FEEA6C',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1.5),
    },
    illustrationIconWrapper: {
        width: wp(24),
        height: hp(14),
        backgroundColor: '#AD47FF',
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#a78bfa',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.18,
        shadowRadius: wp(2),
        elevation: 6,
    },
    illustrationIcon: {
        fontSize: wp(12),
        color: '#fff',
    },
    textBlock: {
        marginBottom: hp(4),
        alignItems: 'center',
    },
    title: {
        color: '#1f2937',
        fontSize: wp(7.4),
        fontWeight: 'bold',
        marginBottom: hp(1.5),
        textAlign: 'center',
        lineHeight: hp(4.5),
    },
    subtitle: {
        color: '#4b5563',
        fontSize: wp(5),
        marginBottom: hp(0.8),
        textAlign: 'center',
        lineHeight: hp(3),
    },
    description: {
        color: '#6b7280',
        fontSize: wp(3.8),
        textAlign: 'center',
        lineHeight: hp(2.7),
    },
    button: {
        width: '100%',
        backgroundColor: '#AD47FF',
        paddingVertical: hp(2),
        borderRadius: wp(4.5),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: hp(7),
    },
    buttonText: {
        color: '#fff',
        fontSize: wp(5),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});