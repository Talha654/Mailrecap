import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/ui/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { SCREENS } from '../navigation';

export const SettingsScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NavigationProp>();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const getCurrentLanguageText = () => {
        switch (i18n.language) {
            case 'es':
                return 'Actual: Español';
            case 'ht':
                return 'Kounye a: Kreyòl';
            default:
                return 'Current: English';
        }
    };

    const languages = [
        { code: 'en', name: t('settings.english') },
        { code: 'es', name: t('settings.spanish') },
        { code: 'ht', name: t('settings.haitianCreole') },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#BFDBFE', '#93C5FD', '#DDD6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.root}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('settings.title')}</Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Language Settings */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('settings.language')}</Text>
                        <Text style={styles.currentLanguageText}>{getCurrentLanguageText()}</Text>

                        <View style={styles.languageButtonsContainer}>
                            {languages.map((lang) => {
                                const isSelected = i18n.language === lang.code;
                                return (
                                    <CustomButton
                                        key={lang.code}
                                        title={`${lang.name} ${isSelected ? '✓' : ''}`}
                                        onPress={() => changeLanguage(lang.code)}
                                        style={
                                            isSelected
                                                ? styles.selectedLanguageButton
                                                : styles.unselectedLanguageButton
                                        }
                                        textStyle={
                                            isSelected
                                                ? styles.selectedLanguageButtonText
                                                : styles.unselectedLanguageButtonText
                                        }
                                    />
                                );
                            })}
                        </View>
                    </View>

                    {/* Subscription Info */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('settings.subscription')}</Text>
                        <View style={styles.subscriptionContent}>
                            <Text style={styles.subscriptionInfo}>{t('settings.subscriptionInfo')}</Text>
                            <Text style={styles.usageText}>{t('settings.usage')}</Text>
                            <View style={styles.progressBarContainer}>
                                <LinearGradient
                                    colors={['#A855F7', '#9333EA']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.progressBar}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Family Sharing */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('settings.family')}</Text>
                        <CustomButton
                            title={`+ ${t('settings.addFamily')}`}
                            onPress={() => {
                                // TODO: Navigate to family sharing screen
                                console.log('Family sharing not implemented yet');
                            }}
                            style={styles.familyButton}
                            textStyle={styles.familyButtonText}
                        />
                    </View>

                    {/* Privacy & Help */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('settings.privacy')}</Text>
                        <View style={styles.privacyButtonsContainer}>
                            <CustomButton
                                title={`📞 ${t('settings.help')}`}
                                onPress={() => {
                                    // TODO: Navigate to help screen
                                    console.log('Help & Support not implemented yet');
                                }}
                                style={styles.helpButton}
                                textStyle={styles.helpButtonText}
                            />
                            <CustomButton
                                title={`🔒 ${t('settings.privacy_policy')}`}
                                onPress={() => navigation.navigate(SCREENS.PRIVACY_POLICY)}
                                style={styles.helpButton}
                                textStyle={styles.helpButtonText}
                            />
                            <CustomButton
                                title={`📄 ${t('settings.terms_of_service')}`}
                                onPress={() => navigation.navigate(SCREENS.TERMS_OF_SERVICE)}
                                style={styles.helpButton}
                                textStyle={styles.helpButtonText}
                            />
                        </View>
                    </View>

                    {/* Cancel Subscription */}
                    <View style={styles.card}>
                        <CustomButton
                            title={t('settings.cancel')}
                            onPress={() => {
                                // TODO: Handle subscription cancellation
                                console.log('Cancel subscription not implemented yet');
                            }}
                            style={styles.cancelButton}
                            textStyle={styles.cancelButtonText}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: wp(5),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        marginRight: wp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.3) },
        shadowOpacity: 0.15,
        shadowRadius: wp(2),
        elevation: 5,
    },
    backButtonText: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#374151',
    },
    headerTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#1f2937',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(3),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(5),
        marginBottom: hp(2.5),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.12,
        shadowRadius: wp(3),
        elevation: 6,
    },
    cardTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(1.5),
    },
    currentLanguageText: {
        fontSize: wp(3.8),
        color: '#6b7280',
        marginBottom: hp(1.5),
    },
    languageButtonsContainer: {
        gap: hp(1.2),
    },
    selectedLanguageButton: {
        backgroundColor: '#9333EA',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    unselectedLanguageButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    selectedLanguageButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold' as const,
    },
    unselectedLanguageButtonText: {
        color: '#374151',
        fontSize: wp(4),
        fontWeight: 'bold' as const,
    },
    subscriptionContent: {
        gap: hp(1.2),
    },
    subscriptionInfo: {
        fontSize: wp(4),
        color: '#1f2937',
    },
    usageText: {
        fontSize: wp(3.5),
        color: '#6b7280',
    },
    progressBarContainer: {
        width: '100%',
        height: hp(1.2),
        backgroundColor: '#E5E7EB',
        borderRadius: hp(0.6),
        overflow: 'hidden',
        marginTop: hp(0.5),
    },
    progressBar: {
        width: '30%',
        height: '100%',
        borderRadius: hp(0.6),
    },
    familyButton: {
        backgroundColor: '#10B981',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    familyButtonText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#fff',
    },
    privacyButtonsContainer: {
        gap: hp(1.2),
    },
    helpButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    helpButtonText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#374151',
    },
    cancelButton: {
        backgroundColor: '#EF4444',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    cancelButtonText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#fff',
    },
});
