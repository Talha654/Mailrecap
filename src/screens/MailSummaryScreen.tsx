import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { CustomButton } from '../components/ui/CustomButton';
import { wp, hp } from '../constants/StyleGuide';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

type MailSummaryScreenRouteProp = RouteProp<RootStackParamList, 'MailSummary'>;

export const MailSummaryScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const route = useRoute<MailSummaryScreenRouteProp>();
    const mailItem = route.params?.mailItem || null;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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
        navigation.navigate('Home');
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
            <LinearGradient
                colors={['#BFDBFE', '#93C5FD', '#DDD6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
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
                    {/* Mail Title */}
                    <View style={styles.card}>
                        <Text style={styles.mailTitle}>{mailItem.title}</Text>
                        <Text style={styles.mailDate}>{mailItem.date}</Text>
                    </View>

                    {/* Voice Summary */}
                    <View style={styles.card}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.sectionTitle}>{t('mailSummary.summary')}</Text>
                            <TouchableOpacity
                                onPress={handleListen}
                                style={[
                                    styles.listenButton,
                                    isPlaying ? styles.listenButtonPlaying : styles.listenButtonDefault
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.listenButtonText}>
                                    {isPlaying ? '⏸️' : '🔊'} {isPlaying ? t('mailSummary.stop') : t('mailSummary.listen')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.summaryText}>{mailItem.summary}</Text>
                    </View>

                    {/* Full Text */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{t('mailSummary.fullText')}</Text>
                        <Text style={styles.fullText}>{mailItem.fullText}</Text>
                    </View>

                    {/* Suggestions Section */}
                    {!showSuggestions ? (
                        <View style={styles.card}>
                            <Text style={styles.askSuggestionsText}>
                                {t('mailSummary.askSuggestions')}
                            </Text>
                            <View style={styles.suggestionButtonsContainer}>
                                <CustomButton
                                    title={t('mailSummary.yes')}
                                    onPress={() => setShowSuggestions(true)}
                                    style={styles.yesButton}
                                    textStyle={styles.yesButtonText}
                                />
                                <CustomButton
                                    title={t('mailSummary.no')}
                                    onPress={handleHome}
                                    style={styles.noButton}
                                    textStyle={styles.noButtonText}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>{t('mailSummary.suggestions')}</Text>
                            <View style={styles.suggestionsContainer}>
                                {mailItem.suggestions.map((suggestion, index) => (
                                    <View key={index} style={styles.suggestionItem}>
                                        <View style={styles.suggestionNumber}>
                                            <Text style={styles.suggestionNumberText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.suggestionText}>{suggestion}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Disclaimer Footer */}
                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>
                            {t('mailSummary.disclaimer')}
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        paddingBottom: hp(3),
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(6),
        padding: wp(5),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    mailTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(0.5),
    },
    mailDate: {
        fontSize: wp(3.5),
        color: '#6B7280',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(1.5),
    },
    listenButton: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(4),
    },
    listenButtonDefault: {
        backgroundColor: '#8B5CF6',
    },
    listenButtonPlaying: {
        backgroundColor: '#EF4444',
    },
    listenButtonText: {
        color: '#FFFFFF',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    summaryText: {
        fontSize: wp(4.5),
        color: '#374151',
        lineHeight: wp(6.5),
    },
    fullText: {
        fontSize: wp(3.8),
        color: '#374151',
        lineHeight: wp(5.5),
    },
    askSuggestionsText: {
        fontSize: wp(4.5),
        color: '#374151',
        textAlign: 'center',
        marginBottom: hp(2.5),
        lineHeight: wp(6.5),
    },
    suggestionButtonsContainer: {
        gap: hp(1.5),
    },
    yesButton: {
        backgroundColor: '#10B981',
        paddingVertical: hp(1.8),
    },
    yesButtonText: {
        fontSize: wp(4.5),
    },
    noButton: {
        backgroundColor: '#F3F4F6',
    },
    noButtonText: {
        color: '#374151',
        fontSize: wp(4.5),
    },
    suggestionsContainer: {
        gap: hp(1.2),
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F3E8FF',
        borderRadius: wp(4),
        padding: wp(4),
    },
    suggestionNumber: {
        width: wp(6),
        height: wp(6),
        backgroundColor: '#8B5CF6',
        borderRadius: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
        marginTop: hp(0.2),
    },
    suggestionNumberText: {
        color: '#FFFFFF',
        fontSize: wp(3.2),
        fontWeight: 'bold',
    },
    suggestionText: {
        flex: 1,
        fontSize: wp(3.8),
        color: '#374151',
        lineHeight: wp(5.5),
    },
    disclaimerContainer: {
        backgroundColor: '#EEEFF1',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
    },
    disclaimerText: {
        fontSize: wp(2.8),
        color: '#4A5565',
        lineHeight: wp(4),
    },
});