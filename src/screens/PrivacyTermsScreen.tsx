import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '../components/ui/CustomButton';
import { wp, hp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SCREENS } from '../navigation/screens';
import { useNavigation } from '@react-navigation/native';

export const PrivacyTermsScreen: React.FC = () => {
    const { t } = useTranslation();

    const navigation: any = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>📋</Text>
                            </View>
                            <Text style={styles.title}>
                                {t('privacyTerms.title')}
                            </Text>
                        </View>

                        {/* Body Text */}
                        <View style={styles.bodyContainer}>
                            <Text style={styles.bodyText}>
                                {t('privacyTerms.body')}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <CustomButton
                                onPress={() => { navigation.navigate(SCREENS.PRIVACY_POLICY) }}
                                title={t('privacyTerms.viewPrivacy')}
                                style={styles.secondaryButton}
                                textStyle={styles.secondaryButtonText}
                            />

                            <CustomButton
                                onPress={() => { navigation.navigate(SCREENS.TERMS_OF_SERVICE) }}
                                title={t('privacyTerms.viewTerms')}
                                style={styles.secondaryButton}
                                textStyle={styles.secondaryButtonText}
                            />
                        </View>

                        {/* Continue Button */}
                        <CustomButton
                            onPress={() => { navigation.navigate(SCREENS.SUBSCRIPTION_PLAN) }}
                            title={t('privacyTerms.continue')}
                            style={styles.primaryButton}
                            textStyle={styles.primaryButtonText}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
    },
    card: {
        width: '100%',
        maxWidth: wp(90),
        backgroundColor: 'white',
        borderRadius: wp(6),
        padding: wp(8),
    },
    header: {
        alignItems: 'center',
        marginBottom: hp(4),
    },
    iconContainer: {
        width: wp(16),
        height: wp(16),
        backgroundColor: '#3385FF',
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    icon: {
        fontSize: wp(6),
        color: 'white',
    },
    title: {
        fontSize: wp(7),
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    bodyContainer: {
        marginBottom: hp(4),
        paddingHorizontal: wp(3)
    },
    bodyText: {
        fontSize: wp(4.2),
        color: '#374151',
        lineHeight: wp(5.5),
        textAlign: 'left',
    },
    buttonContainer: {
        marginBottom: hp(3),
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: wp(4),
        paddingVertical: hp(1.5),
        marginBottom: hp(1),
    },
    secondaryButtonText: {
        color: '#1F2937',
        fontSize: wp(4),
        fontWeight: '600',
    },
    primaryButton: {
        borderRadius: wp(4),
        paddingVertical: hp(1.3),
    },
    primaryButtonText: {
        color: 'white',
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
});