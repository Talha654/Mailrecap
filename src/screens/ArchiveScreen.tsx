import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { wp, hp } from '../constants/StyleGuide';
import { MailItem } from '../types/mail';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

export const ArchiveScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    const [mailItems, setMailItems] = useState<MailItem[]>([
        {
            id: '1',
            title: 'Electric Bill - Due Soon',
            summary: 'Your electric bill is $127.45 and due on March 25th.',
            fullText: 'Dear Customer, Your electric bill for February is $127.45. Payment is due by March 25th, 2024. You can pay online, by phone, or by mail.',
            suggestions: ['Pay online at company website', 'Set up automatic payments', 'Call customer service: 1-800-555-0123'],
            date: '2024-03-15'
        },
        {
            id: '2',
            title: 'Doctor Appointment Reminder',
            summary: 'Appointment with Dr. Smith on March 20th at 2:00 PM.',
            fullText: 'This is a reminder of your upcoming appointment with Dr. Smith on March 20th, 2024 at 2:00 PM. Please arrive 15 minutes early.',
            suggestions: ['Add to calendar', 'Prepare list of questions', 'Bring insurance card and ID'],
            date: '2024-03-12'
        },
        {
            id: '3',
            title: 'New Mail Item',
            summary: 'This letter is about a subscription renewal for your magazine. It costs $29.99 per year.',
            fullText: 'Dear Subscriber, We hope you have enjoyed your magazine subscription. Your subscription will expire next month. To continue receiving your magazine, please renew for $29.99 per year.',
            suggestions: ['Renew subscription online', 'Call customer service', 'Consider digital subscription instead'],
            date: new Date().toISOString().split('T')[0]
        }
    ]);


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
                <Text style={styles.emptyIcon}>📂</Text>
            </View>
            <Text style={styles.emptyTitle}>
                {t('archive.empty')}
            </Text>
            <Text style={styles.emptyDescription}>
                {t('archive.emptyDesc')}
            </Text>
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
                        <Text style={styles.arrowIcon}>→</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backButtonText}>← {t('archive.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('archive.title')}</Text>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {mailItems.length === 0 ? renderEmptyState() : (
                        <View style={styles.mailListContainer}>
                            {mailItems.map(renderMailItem)}
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        backgroundColor: '#F3F4F6',
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
        backgroundColor: '#F3E8FF',
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