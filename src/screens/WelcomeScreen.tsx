import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
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
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Mail Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <View style={styles.mailIcon}>
                            <View style={styles.mailEnvelope} />
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>MailRecap</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>Your Smart Mail Assistant</Text>

                {/* Description */}
                <Text style={styles.description}>
                    Snap a photo, get an instant AI summary. Never miss important mail.
                </Text>

                {/* Get Started Button */}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={t('welcome.getStartedFree')}
                        style={{ width: '70%' }}
                        onPress={() => navigation.navigate(SCREENS.LANGUAGE_SELECTION)}
                    />
                </View>

                {/* Free Scan Info */}
                <Text style={styles.freeInfo}>{t('welcome.freeScanInfo')}</Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconCircle}>
                            <Text style={styles.featureIcon}>⚡</Text>
                        </View>
                        <Text style={styles.featureLabel}>{t('welcome.featureInstant')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconCircle}>
                            <Text style={styles.featureIcon}>🛡️</Text>
                        </View>
                        <Text style={styles.featureLabel}>{t('welcome.featurePrivate')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconCircle}>
                            <Text style={styles.featureIcon}>⏱️</Text>
                        </View>
                        <Text style={styles.featureLabel}>{t('welcome.featureSimple')}</Text>
                    </View>
                </View>

                {/* Privacy Notice */}
                <View style={styles.privacyNotice}>
                    <Text style={styles.privacyIcon}>🛡️</Text>
                    <Text style={styles.privacyText}>
                        {t('welcome.privacyNotice')}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={() => console.log('Privacy Policy pressed')}>
                            <Text style={styles.footerLink}>{t('welcome.footerPrivacy')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('Terms of Service pressed')}>
                            <Text style={styles.footerLink}>{t('welcome.footerTerms')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.copyright}>
                        {t('welcome.copyright')}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: wp(8),
        paddingTop: hp(4),
        paddingBottom: hp(4),
    },
    iconContainer: {
        marginBottom: hp(4),
    },
    iconCircle: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        backgroundColor: '#E8F1FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: wp(9),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: hp(1.5),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(5),
        color: '#6B7280',
        marginBottom: hp(4),
        textAlign: 'center',
    },
    description: {
        fontSize: wp(4.2),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: hp(3.2),
        marginBottom: hp(4),
        paddingHorizontal: wp(4),
    },
    buttonContainer: {
        width: '100%',
        marginBottom: hp(2),
    },
    freeInfo: {
        fontSize: wp(3.8),
        color: '#6B7280',
        marginBottom: hp(6),
        textAlign: 'center',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: hp(6),
        paddingHorizontal: wp(8),
    },
    featureItem: {
        alignItems: 'center',
    },
    featureIconCircle: {
        width: wp(14),
        height: wp(14),
        borderRadius: wp(7),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1),
    },
    featureIcon: {
        fontSize: wp(7),
    },
    featureLabel: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#1F2937',
    },
    mailIcon: {
        width: wp(16),
        height: wp(12),
        position: 'relative',
    },
    mailEnvelope: {
        width: wp(10),
        height: wp(10),
        backgroundColor: '#4285F4',
        borderRadius: wp(2),
        borderWidth: 2,
        borderColor: '#4285F4',
    },
    privacyNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: hp(2),
        paddingHorizontal: wp(6),
        borderRadius: wp(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    privacyIcon: {
        fontSize: wp(4.5),
        marginRight: wp(1),
    },
    privacyText: {
        fontSize: wp(3.5),
        color: '#6B7280',
        marginLeft: wp(1),
        textAlign: 'center',
    },
    footer: {
        marginTop: hp(6),
        alignItems: 'center',
        width: '100%',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
        gap: wp(8),
    },
    footerLink: {
        fontSize: wp(4),
        color: '#6B7280',
        fontWeight: '500',
    },
    copyright: {
        fontSize: wp(3.5),
        color: '#9CA3AF',
        textAlign: 'center',
    },
});