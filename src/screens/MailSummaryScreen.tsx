import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Volume2 } from 'lucide-react-native';
import { CustomButton } from '../components/ui/CustomButton';
import { wp, hp } from '../constants/StyleGuide';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';
import { fonts } from '../constants/fonts';
import { icons, images } from '../constants/images';
import { ttsService } from '../services/ttsService';

type MailSummaryScreenRouteProp = RouteProp<RootStackParamList, 'MailSummary'>;

export const MailSummaryScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const route = useRoute<MailSummaryScreenRouteProp>();
    const mailItem = route.params?.mailItem || null;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullTextExpanded, setIsFullTextExpanded] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const user = auth().currentUser;
                if (user) {
                    const userDoc = await firestore().collection('users').doc(user.uid).get();
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setSubscriptionPlan(userData?.subscriptionPlan || null);
                    }
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
            } finally {
                setLoadingSubscription(false);
            }
        };

        fetchSubscription();
    }, []);

    useEffect(() => {
        // Initialize TTS service when component mounts
        ttsService.initialize();

        // Cleanup when component unmounts
        return () => {
            ttsService.stop();
            ttsService.removeAllListeners();
        };
    }, []);

    const canReadOutLoud = () => {
        // Only applies to free 1 week trial and Mailrecap+ plan
        if (!subscriptionPlan) return false;
        return subscriptionPlan === 'free_trial' || subscriptionPlan.includes('plus');
    };

    const handleListen = async () => {
        if (!mailItem?.summary) return;

        if (isPlaying) {
            // Stop speaking
            await ttsService.stop();
            setIsPlaying(false);
        } else {
            setIsGeneratingAudio(true);

            // Construct text to speak
            let textToSpeak = mailItem.summary;

            // Add next steps if available
            if (mailItem.suggestions && mailItem.suggestions.length > 0) {
                // Add a pause before next steps
                textToSpeak += '. ' + t('mailSummary.nextSteps') + '. ';

                // Add each suggestion
                mailItem.suggestions.forEach((suggestion, index) => {
                    textToSpeak += `${suggestion}. `;
                });
            }

            // Start speaking
            await ttsService.speak(
                textToSpeak,
                // onStart callback
                () => {
                    setIsGeneratingAudio(false);
                    setIsPlaying(true);
                },
                // onFinish callback
                () => {
                    setIsPlaying(false);
                    ttsService.setIsSpeaking(false);
                },
                // onError callback
                (error) => {
                    setIsGeneratingAudio(false);
                    console.error('TTS Error:', error);
                    setIsPlaying(false);
                    ttsService.setIsSpeaking(false);
                }
            );
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleHome = () => {
        navigation.navigate(SCREENS.HOME);
    };

    const handleUnlockUnlimited = () => {
        navigation.navigate(SCREENS.SUBSCRIPTION_PLAN);
    };

    const handleUpgradeNow = () => {
        navigation.navigate(SCREENS.SUBSCRIPTION_PLAN);
    };

    const handlePrivacy = () => {
        // Navigate to privacy policy or open URL
        console.log('Privacy policy');
    };

    const handleTerms = () => {
        // Navigate to terms or open URL
        console.log('Terms and conditions');
    };

    if (!mailItem) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('mailSummary.noMailFound')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image source={images.mailrecap} style={styles.headerButtonIcon} resizeMode="contain" />
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Free Scan Banner */}
                {/* <View style={styles.freeScanBanner}>
                    <View style={styles.checkIconContainer}>
                        <View style={styles.checkIcon}>
                            <Text style={styles.checkIconText}>✓</Text>
                        </View>
                    </View>
                    <Text style={styles.freeScanTitle}>{t('mailSummary.freeScanUsed')}</Text>
                    <Text style={styles.freeScanSubtitle}>{t('mailSummary.getUnlimited')}</Text>
                    <TouchableOpacity
                        style={styles.unlockButton}
                        onPress={handleUnlockUnlimited}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.unlockButtonIcon}>✨</Text>
                        <Text style={styles.unlockButtonText}>{t('mailSummary.unlockUnlimited')}</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Main Content Card */}
                <View style={styles.mainCard}>
                    {/* Mail Title */}
                    <Text style={styles.mailTitle}>{mailItem.title}</Text>
                    <Text style={styles.mailDate}>{mailItem.date}</Text>

                    {/* Summary Section */}
                    <View style={styles.section}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.sectionTitle}>{t('mailSummary.summary')}</Text>
                        </View>
                        <Text style={styles.summaryText}>{mailItem.summary}</Text>

                        {canReadOutLoud() && (
                            <TouchableOpacity
                                style={styles.readOutLoudButton}
                                onPress={handleListen}
                                activeOpacity={0.7}
                            >
                                {isGeneratingAudio ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.readOutLoudIcon} />
                                ) : (
                                    <Volume2 size={wp(5)} color="#FFFFFF" style={styles.readOutLoudIcon} />
                                )}
                                <Text style={styles.readOutLoudText}>
                                    {isGeneratingAudio
                                        ? 'Generating...'
                                        : (isPlaying ? t('mailSummary.stopReading') : t('mailSummary.readOutLoud'))
                                    }
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Next Steps Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('mailSummary.nextSteps')}</Text>
                        <View style={styles.nextStepsContainer}>
                            {mailItem.suggestions.map((suggestion, index) => (
                                <View key={index} style={styles.nextStepItem}>
                                    <View style={styles.stepNumberContainer}>
                                        <Text style={styles.stepNumber}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.nextStepText}>{suggestion}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Full Text Section - Collapsible */}
                    {/* <View style={[styles.section, { marginBottom: 0 }]}>
                        <TouchableOpacity
                            style={styles.fullTextHeader}
                            onPress={() => setIsFullTextExpanded(!isFullTextExpanded)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sectionTitle}>{t('mailSummary.fullText')}</Text>
                            <Text style={styles.expandIcon}>{isFullTextExpanded ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {isFullTextExpanded && (
                            <Text style={styles.fullText}>{mailItem.fullText}</Text>
                        )}
                    </View> */}
                </View>

                {/* AI Disclaimer */}
                <View style={styles.aiDisclaimer}>
                    <Text style={styles.aiDisclaimerText}>{t('mailSummary.aiDisclaimer')}</Text>
                </View>

                {/* Upgrade Now Button / Free Trial Bottom Section */}
                {/* {subscriptionPlan === 'free_trial' ? ( */}

                {/* <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={handleUpgradeNow}
                    activeOpacity={0.8}
                >
                    <Text style={styles.upgradeButtonText}>{t('mailSummary.upgradeNow')}</Text>
                </TouchableOpacity> */}


                {/* Home Button */}
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={handleHome}
                    activeOpacity={0.8}
                >
                    <Text style={styles.homeButtonText}>{t('mailSummary.home')}</Text>
                </TouchableOpacity>

                {/* Footer Links */}
                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={handlePrivacy} activeOpacity={0.8}>
                        <Text style={styles.footerLinkText}>Privacy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleTerms} activeOpacity={0.8}>
                        <Text style={styles.footerLinkText}>Terms</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/*Free Trial Bottom Section */}
            {(!subscriptionPlan || subscriptionPlan === 'free_trial') && (
                <View style={styles.bottomSectionContainer}>
                    <Image
                        source={images.bottom_img}
                        style={styles.bottomStripImage}
                        resizeMode="contain"
                    />
                    <View style={styles.trialInfoContainer}>
                        <Text style={styles.trialText}>Free Trial</Text>
                        <Text style={styles.daysLeftText}>7 days left</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.newUpgradeButton}
                        onPress={handleUpgradeNow}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.newUpgradeButtonText}>{t('mailSummary.upgradeNow')}</Text>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EFF5'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: wp(5),
        color: '#4B5563',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
        paddingTop: hp(2),
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(4),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerButtonIcon: {
        width: wp(70),
        height: wp(15),
        tintColor: '#D6212F',
        alignSelf: 'center'
    },
    headerButtonText: {
        color: '#000F54',
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(4),
    },
    // Free Scan Banner
    freeScanBanner: {
        backgroundColor: '#EAF0FF',
        borderRadius: wp(6),
        padding: wp(4),
        alignItems: 'center',
    },
    checkIconContainer: {
        marginBottom: hp(1),
    },
    checkIcon: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: '#D6212F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIconText: {
        color: '#FFFFFF',
        fontSize: wp(5),
        fontWeight: 'bold',
    },
    freeScanTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(0.5),
    },
    freeScanSubtitle: {
        fontSize: wp(3.5),
        color: '#6B7280',
        marginBottom: hp(2),
    },
    unlockButton: {
        backgroundColor: '#000F54',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(8),
        borderRadius: wp(8),
        width: '100%',
    },
    unlockButtonIcon: {
        fontSize: wp(4.5),
        marginRight: wp(2),
    },
    unlockButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    // Main Content Card
    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(2),
        padding: wp(5),
        marginBottom: hp(0),
        borderWidth: 1,
        borderColor: '#E4E4E4'
    },
    mailTitle: {
        fontSize: wp(6.5),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
        color: '#000F54',
        textAlign: 'center',
    },
    mailDate: {
        fontSize: wp(4),
        fontFamily: fonts.sourceSerif.semiBold,
        color: '#6B7280',
        marginBottom: hp(3),
        textAlign: 'center',
    },
    section: {
        marginBottom: hp(2),
    },
    sectionTitle: {
        fontSize: wp(4),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        marginBottom: hp(1.5),
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    readOutLoudButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000F54',
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(6),
        borderRadius: wp(8),
        alignSelf: 'center',
        marginTop: hp(2),
        width: '80%',
    },
    readOutLoudIcon: {
        marginRight: wp(2),
    },
    readOutLoudText: {
        color: '#FFFFFF',
        fontSize: wp(4.5),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
    },
    summaryText: {
        fontSize: wp(3.5),
        color: '#000F54',
        lineHeight: wp(4.5),
        fontFamily: fonts.inter.regular,
    },
    // Next Steps
    nextStepsContainer: {
        gap: hp(1.5),
    },
    nextStepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumberContainer: {
        width: wp(7),
        height: wp(7),
        borderRadius: wp(3.5),
        backgroundColor: '#D6212F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
        marginTop: hp(0.3),
    },
    stepNumber: {
        color: '#FFFFFF',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    nextStepText: {
        flex: 1,
        fontSize: wp(3.8),
        color: '#374151',
        lineHeight: wp(5.5),
    },
    // Full Text Section
    fullTextHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    expandIcon: {
        fontSize: wp(3.5),
        color: '#6B7280',
    },
    fullText: {
        fontSize: wp(3.8),
        color: '#6B7280',
        lineHeight: wp(5.5),
        marginTop: hp(1.5),
    },
    // AI Disclaimer
    aiDisclaimer: {
        borderRadius: wp(3),
        padding: wp(3),
    },
    aiDisclaimerText: {
        fontSize: wp(3.2),
        color: '#000',
        textAlign: 'center',
    },
    // Upgrade Button
    upgradeButton: {
        backgroundColor: '#000F54',
        paddingVertical: hp(2),
        borderRadius: wp(8),
        marginBottom: hp(2),
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    // Home Button
    homeButton: {
        backgroundColor: 'transparent',
        paddingVertical: hp(1.5),
        marginBottom: hp(2),
        alignItems: 'center',
        borderRadius: wp(10),
        borderWidth: 1,
        borderColor: '#000F54'
    },
    homeButtonText: {
        color: '#000F54',
        fontSize: wp(4),
        fontWeight: '600',
    },
    // Footer Links
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp(8),
        paddingBottom: hp(2),
    },
    footerLinkText: {
        color: '#6B7280',
        fontSize: wp(3.8),
        fontWeight: '500',
    },
    // New Bottom Section Styles
    bottomSectionContainer: {
        // marginBottom: hp(2),
        borderRadius: wp(2),
        overflow: 'hidden',
        backgroundColor: '#D0D8E5', // Light grey/blue background from image
    },
    bottomStripImage: {
        width: '110%',
        height: hp(2),
        resizeMode: 'contain'
    },
    trialInfoContainer: {
        backgroundColor: '#B1BDC8',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        alignItems: 'center',
    },
    trialText: {
        fontSize: wp(5.5),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
        color: '#000F54',
    },
    daysLeftText: {
        fontSize: wp(5.5),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
        color: '#000F54',
    },
    newUpgradeButton: {
        backgroundColor: '#000F54',
        paddingVertical: hp(2),
        alignItems: 'center',
        width: '100%',
    },
    newUpgradeButtonText: {
        color: '#FFFFFF',
        fontSize: wp(6),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
    },
});