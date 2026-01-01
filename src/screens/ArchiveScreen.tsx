import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { wp, hp } from '../constants/StyleGuide';
import { MailItem } from '../types/mail';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserMailSummaries } from '../services/mailSummary.service';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react-native';

export const ArchiveScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    const [mailItems, setMailItems] = useState<MailItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch mail summaries from Firestore
    const fetchMailSummaries = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const summaries = await getUserMailSummaries();

            // Convert to MailItem format
            const items: MailItem[] = summaries.map(summary => ({
                id: summary.id,
                userId: summary.userId,
                title: summary.title,
                summary: summary.summary,
                fullText: summary.fullText,
                suggestions: summary.suggestions,
                photoUrl: summary.photoUrl,
                date: summary.createdAt.toISOString().split('T')[0],
                createdAt: summary.createdAt,
                updatedAt: summary.updatedAt,
            }));

            setMailItems(items);
            console.log('[ArchiveScreen] Loaded', items.length, 'mail summaries');
        } catch (err) {
            console.error('[ArchiveScreen] Error fetching summaries:', err);
            setError('Failed to load summaries. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Load summaries on mount
    useEffect(() => {
        fetchMailSummaries();
    }, []);

    // Handle pull-to-refresh
    const handleRefresh = () => {
        fetchMailSummaries(true);
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Mail color={'#fff'} size={wp(10)} />
            </View>
            <Text style={styles.emptyTitle}>
                {error ? t('archive.errorLoading') : t('archive.empty')}
            </Text>
            <Text style={styles.emptyDescription}>
                {error ? t('archive.errorLoadingMessage') : t('archive.emptyDesc')}
            </Text>
            {error && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchMailSummaries()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.retryButtonText}>{t('archive.retry')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderMailItem = (mailItem: MailItem) => (
        <TouchableOpacity
            key={mailItem.id}
            style={styles.mailItemContainer}
            onPress={() => navigation.navigate(SCREENS.MAIL_SUMMARY, { mailItem: mailItem })}
            activeOpacity={0.7}
        >
            <View style={styles.mailItemContent}>
                <View style={styles.mailItemTextContainer}>
                    <Text style={styles.mailItemTitle} numberOfLines={2}>
                        {mailItem.title}
                    </Text>
                    <Text style={styles.mailItemSummary} numberOfLines={2}>
                        {mailItem.summary}
                    </Text>
                    <Text style={styles.mailItemDate}>
                        {formatDate(mailItem.date)}
                    </Text>
                </View>
                <View style={styles.mailItemArrowContainer}>
                    <View style={styles.arrowIconContainer}>
                        <ArrowRight color={'#fff'} size={wp(6)} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonContainer}>
                        <ArrowLeft />
                        <Text style={styles.backButtonText}> {t('archive.back')}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('archive.title')}</Text>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D6212F" />
                    <Text style={styles.loadingText}>{t('archive.loading')}</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#D6212F"
                            colors={['#D6212F']}
                        />
                    }
                >
                    {mailItems.length === 0 ? renderEmptyState() : (
                        <View style={styles.mailListContainer}>
                            {mailItems.map(renderMailItem)}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EFF5'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
    },
    backButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(5),
        marginRight: wp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#374151',
        fontSize: wp(4),
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(3),
    },
    emptyContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(8),
        padding: wp(8),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        marginTop: hp(2),
    },
    emptyIconContainer: {
        width: wp(20),
        height: wp(20),
        backgroundColor: '#D6212F',
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
    },
    emptyIcon: {
        fontSize: wp(12),
    },
    emptyTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: hp(2),
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: wp(4),
        color: '#6B7280',
        lineHeight: wp(6),
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#9333EA',
        paddingHorizontal: wp(8),
        paddingVertical: hp(1.5),
        borderRadius: wp(5),
        marginTop: hp(2),
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    loadingText: {
        marginTop: hp(2),
        fontSize: wp(4),
        color: '#4B5563',
        fontWeight: '500',
    },
    mailListContainer: {
        marginTop: hp(2),
    },
    mailItemContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(8),
        padding: wp(6),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    mailItemContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    mailItemTextContainer: {
        flex: 1,
        marginRight: wp(3),
    },
    mailItemTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(1),
        lineHeight: wp(5.5),
    },
    mailItemSummary: {
        fontSize: wp(4),
        color: '#4B5563',
        marginBottom: hp(1.5),
        lineHeight: wp(5.5),
    },
    mailItemDate: {
        fontSize: wp(3.5),
        color: '#6B7280',
    },
    mailItemArrowContainer: {
        justifyContent: 'center',
    },
    arrowIconContainer: {
        width: wp(8),
        height: wp(8),
        backgroundColor: '#D6212F',
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowIcon: {
        color: '#9333EA',
        fontSize: wp(5),
        fontWeight: '600',
    },
});