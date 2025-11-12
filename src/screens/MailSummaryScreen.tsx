import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { CustomButton } from '../components/ui/CustomButton';
import { wp, hp } from '../constants/StyleGuide';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';

type MailSummaryScreenRouteProp = RouteProp<RootStackParamList, 'MailSummary'>;

export const MailSummaryScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const route = useRoute<MailSummaryScreenRouteProp>();
    const mailItem = route.params?.mailItem || null;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullTextExpanded, setIsFullTextExpanded] = useState(false);

    useEffect(() => {
        // Auto-play summary announcement when screen loads
        if (mailItem) {
            // In a real app, this would use text-to-speech API
            console.log(`Speaking: ${mailItem.summary}`);
        }
    }, [mailItem]);

    const handleListen = () => {
        setIsPlaying(!isPlaying);
        // In a real app, this would use text-to-speech
        if (!isPlaying) {
            console.log(`Speaking: ${mailItem?.summary}`);
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
            <LinearGradient
                colors={['#BFDBFE', '#93C5FD', '#DDD6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('mailSummary.noMailFound')}</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.headerButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.headerButtonText}>← {t('mailSummary.back')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleHome}
                        style={styles.headerButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.headerButtonText}>🏠 {t('mailSummary.home')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Free Scan Banner */}
                    <View style={styles.freeScanBanner}>
                        <View style={styles.checkIconContainer}>
                            <View style={styles.checkIcon}>
                                <Text style={styles.checkIconText}>✓</Text>
                            </View>
                        </View>
                        <Text style={styles.freeScanTitle}>Free scan used</Text>
                        <Text style={styles.freeScanSubtitle}>Get unlimited scans with Pro</Text>
                        <TouchableOpacity
                            style={styles.unlockButton}
                            onPress={handleUnlockUnlimited}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.unlockButtonIcon}>✨</Text>
                            <Text style={styles.unlockButtonText}>Unlock Unlimited</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Content Card */}
                    <View style={styles.mainCard}>
                        {/* Mail Title */}
                        <Text style={styles.mailTitle}>{mailItem.title}</Text>
                        <Text style={styles.mailDate}>{mailItem.date}</Text>

                        {/* Summary Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Summary</Text>
                            <Text style={styles.summaryText}>{mailItem.summary}</Text>
                        </View>

                        {/* Next Steps Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Next Steps</Text>
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
                        <View style={[styles.section,{marginBottom:0}]}>
                            <TouchableOpacity
                                style={styles.fullTextHeader}
                                onPress={() => setIsFullTextExpanded(!isFullTextExpanded)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.sectionTitle}>Full Text</Text>
                                <Text style={styles.expandIcon}>{isFullTextExpanded ? '▲' : '▼'}</Text>
                            </TouchableOpacity>
                            {isFullTextExpanded && (
                                <Text style={styles.fullText}>{mailItem.fullText}</Text>
                            )}
                        </View>
                    </View>

                         {/* AI Disclaimer */}
                        <View style={styles.aiDisclaimer}>
                            <Text style={styles.aiDisclaimerText}>⚠️ AI-generated. Verify important details.</Text>
                        </View>

                    {/* Upgrade Now Button */}
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={handleUpgradeNow}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                    </TouchableOpacity>

                    {/* Home Button */}
                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={handleHome}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.homeButtonText}>Home</Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#fff'
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        paddingTop: hp(2),
    },
    headerButton: {
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
    headerButtonText: {
        color: '#374151',
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
        padding: wp(6),
        marginBottom: hp(2),
        alignItems: 'center',
    },
    checkIconContainer: {
        marginBottom: hp(1.5),
    },
    checkIcon: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: '#3B82F6',
        borderWidth: 3,
        borderColor: '#93C5FD',
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
        backgroundColor: '#2E70FF',
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
        borderRadius: wp(6),
        padding: wp(5),
        marginBottom: hp(2),
        borderWidth:1,
        borderColor:'#E4E4E4'
    },
    mailTitle: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(0.8),
    },
    mailDate: {
        fontSize: wp(3.5),
        color: '#6B7280',
        marginBottom: hp(2.5),
    },
    section: {
        marginBottom: hp(2.5),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(1.5),
    },
    summaryText: {
        fontSize: wp(4),
        color: '#6B7280',
        lineHeight: wp(6),
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
        backgroundColor: '#3B82F6',
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
        backgroundColor: '#2E70FF',
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
        borderRadius:wp(10),
        borderWidth:1,
        borderColor:'#E4E4E4'
    },
    homeButtonText: {
        color: '#1F2937',
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
});