import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
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

    const handleDownloadData = () => {
        Alert.alert(
            'Download My Data',
            'Your data download request has been submitted. You will receive an email with your data within 30 days.',
            [{ text: 'OK' }]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Deletion',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Request Submitted', 'Your account deletion request has been submitted.');
                    },
                },
            ]
        );
    };

    const handlePrivacyQuestions = () => {
        Linking.openURL('mailto:privacy@mailrecap.com?subject=Privacy Question');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.root}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Legal & Privacy</Text>
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

                    {/* Privacy Policy */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(SCREENS.PRIVACY_POLICY)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                <Icon name="shield-outline" size={wp(6)} color="#3B82F6" />
                            </View>
                            <View style={styles.menuItemTextContainer}>
                                <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                                <Text style={styles.menuItemSubtitle}>Data collection & use</Text>
                            </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    {/* Terms of Service */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(SCREENS.TERMS_OF_SERVICE)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                <Icon name="document-text-outline" size={wp(6)} color="#3B82F6" />
                            </View>
                            <View style={styles.menuItemTextContainer}>
                                <Text style={styles.menuItemTitle}>Terms of Service</Text>
                                <Text style={styles.menuItemSubtitle}>Usage agreement</Text>
                            </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    {/* Data Rights Section */}
                    <Text style={styles.sectionTitle}>Your Data Rights (GDPR/CCPA)</Text>

                    {/* Download My Data */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                <Icon name="download-outline" size={wp(6)} color="#3B82F6" />
                            </View>
                            <Text style={styles.dataRightTitle}>Download My Data</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.requestButton}
                            onPress={handleDownloadData}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.requestButtonText}>Request</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delete Account */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="trash-outline" size={wp(6)} color="#EF4444" />
                            </View>
                            <Text style={styles.dataRightTitle}>Delete Account</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.requestButton, styles.deleteRequestButton]}
                            onPress={handleDeleteAccount}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.deleteRequestButtonText}>Request</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Privacy Questions */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                <Icon name="mail-outline" size={wp(6)} color="#3B82F6" />
                            </View>
                            <Text style={styles.dataRightTitle}>Privacy Questions</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.requestButton}
                            onPress={handlePrivacyQuestions}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.requestButtonText}>Email</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            GDPR & CCPA compliant • Version 1.3 (Jan 2024)
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    root: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: wp(3),
    },
    backButtonText: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#1f2937',
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
        borderRadius: wp(4),
        padding: wp(5),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        backgroundColor: '#2E70FF',
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
    menuItem: {
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    menuItemTextContainer: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: wp(4.2),
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: hp(0.3),
    },
    menuItemSubtitle: {
        fontSize: wp(3.5),
        color: '#9CA3AF',
    },
    chevron: {
        fontSize: wp(7),
        color: '#D1D5DB',
        fontWeight: '300',
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#1f2937',
        marginTop: hp(2),
        marginBottom: hp(1.5),
        paddingHorizontal: wp(1),
    },
    dataRightItem: {
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dataRightTitle: {
        fontSize: wp(4.2),
        fontWeight: '600',
        color: '#1f2937',
    },
    requestButton: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: wp(5),
        paddingHorizontal: wp(5),
        paddingVertical: hp(1),
    },
    requestButtonText: {
        fontSize: wp(3.8),
        fontWeight: '600',
        color: '#1f2937',
    },
    deleteRequestButton: {
        borderColor: '#FEE2E2',
    },
    deleteRequestButtonText: {
        color: '#EF4444',
        fontSize: wp(3.8),
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#F3F4F6',
        borderRadius: wp(4),
        padding: wp(4),
        marginTop: hp(2),
        alignItems: 'center',
    },
    footerText: {
        fontSize: wp(3.2),
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
