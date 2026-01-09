import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/ui/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { SCREENS } from '../navigation';
import { ArrowLeft } from 'lucide-react-native';
import { fonts } from '../constants/fonts';
import { LanguageDropdown } from '../components/LanguageDropdown';
import { signOut, deleteUserAccount } from '../services/auth';
import { CommonActions } from '@react-navigation/native';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { getUserMailSummaries } from '../services/mailSummary.service';
import { Platform } from 'react-native';

export const SettingsScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NavigationProp>();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const languages = [
        { code: 'en', name: t('settings.english') },
        { code: 'es', name: t('settings.spanish') },
        { code: 'ht', name: t('settings.haitianCreole') },
    ];

    const handleDownloadData = async () => {
        Alert.alert(
            t('settings.downloadDataTitle'),
            t('settings.downloadDataMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.yes'),
                    onPress: async () => {
                        try {
                            const summaries = await getUserMailSummaries();
                            if (summaries.length === 0) {
                                Alert.alert(t('common.info'), t('settings.noDataToDownload'));
                                return;
                            }

                            // Generate a single HTML string for all summaries
                            let htmlContent = `
                                <html>
                                  <head>
                                    <style>
                                      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
                                      h1 { text-align: center; color: #000F54; margin-bottom: 30px; }
                                      .summary-item { margin-bottom: 40px; border-bottom: 1px solid #ccc; padding-bottom: 20px; page-break-inside: avoid; }
                                      .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #333; }
                                      .date { font-size: 12px; color: #666; margin-bottom: 10px; }
                                      .section-label { font-weight: bold; margin-top: 20px; font-size: 14px; }
                                      .text-content { font-size: 12px; color: #444;  margin-top: 10;line-height: 1.4;}
                                      ul { margin-top: 0; padding-top: 0; padding-left: 20px; }
                                      li { margin-bottom: 5px; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>${t('settings.mailSummaries')}</h1>
                            `;

                            summaries.forEach(item => {
                                htmlContent += `
                                  <div class="summary-item">
                                    <div class="title">${item.title}</div>
                                    <div class="date">${new Date(item.createdAt).toLocaleDateString()}</div>
                                    
                                    <div class="section-label">Summary:</div>
                                    <div class="text-content">${item.summary ? item.summary.replace(/\n/g, '<br>') : ''}</div>
                                    
                                    <div class="section-label">${t('settings.nextSteps')}:</div>
                                    <div class="text-content">
                                      <ul>
                                        ${item.suggestions && item.suggestions.length > 0
                                        ? item.suggestions.map(s => `<li>${s}</li>`).join('')
                                        : `<li>${t('settings.noSuggestions')}</li>`}
                                      </ul>
                                    </div>
                                  </div>
                                `;
                            });

                            htmlContent += `
                                  </body>
                                </html>
                            `;

                            const folderName = 'Mailrecap Summaries';
                            let targetDir = '';

                            if (Platform.OS === 'android') {
                                targetDir = `${RNFS.DownloadDirectoryPath}/${folderName}`;
                            } else {
                                targetDir = `${RNFS.DocumentDirectoryPath}/${folderName}`;
                            }

                            const exists = await RNFS.exists(targetDir);
                            if (!exists) {
                                await RNFS.mkdir(targetDir);
                            }

                            const options = {
                                html: htmlContent,
                                fileName: `Mailrecap_All_Summaries_${new Date().getTime()}`,
                                directory: 'Documents',
                            };

                            const file = await generatePDF(options);

                            const finalPath = `${targetDir}/${options.fileName}.pdf`;
                            await RNFS.moveFile(file.filePath!, finalPath);

                            Toast.show({
                                type: 'success',
                                text1: t('settings.downloadSuccessToast'),
                                // text2: `${finalPath}`
                            });

                        } catch (error) {
                            console.error('Download data failed:', error);
                            Alert.alert(t('common.error'), (error as Error).message || t('settings.downloadError'));
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.deleteAccountTitle'),
            t('settings.deleteAccountMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUserAccount();
                            Alert.alert(
                                t('common.success'), // Or a specific success message
                                t('settings.accountDeleted'), // You might need to add this key
                                [
                                    {
                                        text: t('common.ok'),
                                        onPress: () => {
                                            navigation.dispatch(
                                                CommonActions.reset({
                                                    index: 0,
                                                    routes: [{ name: SCREENS.LOGIN }],
                                                })
                                            );
                                        }
                                    }
                                ]
                            );
                        } catch (error: any) {
                            console.error('Account deletion failed:', error);
                            let errorMessage = t('errors.generic'); // Fallback
                            if (error.code === 'auth/requires-recent-login') {
                                errorMessage = t('errors.requiresRecentLogin'); // Ideally add this key
                            }
                            Alert.alert(t('common.error'), errorMessage);
                        }
                    },
                },
            ]
        );
    };

    const handlePrivacyQuestions = () => {
        const subject = 'Help with MailRecap';
        const body = `Hi MailRecap Support,
I'm having an issue with the app and could use help.

For example...`;

        const mailtoUrl = `mailto:support@mailrecap.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        Linking.openURL(mailtoUrl);
    };

    const handleLogout = () => {
        Alert.alert(
            t('settings.logout'),
            t('settings.logoutConfirmation'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('settings.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: SCREENS.LOGIN }],
                                })
                            );
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    },
                },
            ]
        );
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
                        <View style={styles.backButtonContainer}>
                            <ArrowLeft />
                            <Text style={styles.backButtonText}> {t('archive.back')}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('settings.legalPrivacy')}</Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Language Settings */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{t('settings.language')}</Text>
                            <LanguageDropdown
                                selectedLanguage={i18n.language}
                                onSelect={changeLanguage}
                                options={languages.map(l => ({ label: l.name, value: l.code }))}
                            />
                        </View>
                    </View>

                    {/* Privacy Policy */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(SCREENS.PRIVACY_POLICY)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#D6212F' }]}>
                                <Icon name="shield-outline" size={wp(6)} color="#fff" />
                            </View>
                            <View style={styles.menuItemTextContainer}>
                                <Text style={styles.menuItemTitle}>{t('settings.privacyPolicyTitle')}</Text>
                                <Text style={styles.menuItemSubtitle}>{t('settings.privacyPolicySubtitle')}</Text>
                            </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    {/* Terms of Service */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(SCREENS.TERMS_OF_SERVICE)}
                        activeOpacity={0.7}
                    // disabled={true}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#D6212F' }]}>
                                <Icon name="document-text-outline" size={wp(6)} color="#fff" />
                            </View>
                            <View style={styles.menuItemTextContainer}>
                                <Text style={styles.menuItemTitle}>{t('settings.termsTitle')}</Text>
                                <Text style={styles.menuItemSubtitle}>{t('settings.termsSubtitle')}</Text>
                            </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    {/* Data Rights Section */}
                    <Text style={styles.sectionTitle}>{t('settings.dataRightsTitle')}</Text>

                    {/* Download My Data */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#D6212F' }]}>
                                <Icon name="download-outline" size={wp(6)} color="#fff" />
                            </View>
                            <Text style={styles.dataRightTitle}>{t('settings.downloadData')}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.requestButton}
                            onPress={handleDownloadData}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.requestButtonText}>{t('settings.request')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Privacy Questions */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#D6212F' }]}>
                                <Icon name="mail-outline" size={wp(6)} color="#fff" />
                            </View>
                            <Text style={styles.dataRightTitle}>{t('settings.support')}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.requestButton}
                            onPress={handlePrivacyQuestions}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.requestButtonText}>{t('settings.email')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delete Account */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="trash-outline" size={wp(6)} color="#EF4444" />
                            </View>
                            <Text style={styles.dataRightTitle}>{t('settings.deleteAccount')}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.requestButton, styles.deleteRequestButton]}
                            onPress={handleDeleteAccount}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.deleteRequestButtonText}>{t('settings.request')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Logout */}
                    <View style={styles.dataRightItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="log-out-outline" size={wp(6)} color="#EF4444" />
                            </View>
                            <Text style={styles.dataRightTitle}>{t('settings.logout')}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.requestButton, styles.deleteRequestButton]}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.deleteRequestButtonText}>{t('settings.logout')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {t('settings.footerCompliance')}
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
        backgroundColor: '#E9EFF5',
    },
    root: {
        flex: 1,
        backgroundColor: '#E9EFF5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: '#E9EFF5',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: wp(3),
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: wp(4),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        marginLeft: wp(1),
    },
    headerTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#000F54',
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
        color: '#000F54',
        marginBottom: hp(1.5),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
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
        flexShrink: 1,
        marginRight: wp(2),
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
        color: '#000F54',
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
        color: '#000F54',
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
        color: '#000F54',
        flex: 1,
        flexWrap: 'wrap',
    },
    requestButton: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: wp(5),
        paddingHorizontal: wp(5),
        paddingVertical: hp(1),
        flexShrink: 0,
    },
    requestButtonText: {
        fontSize: wp(3.8),
        fontWeight: '600',
        color: '#000F54',
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
