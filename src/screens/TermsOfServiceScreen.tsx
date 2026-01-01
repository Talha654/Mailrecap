import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../constants/fonts';

export const TermsOfServiceScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    const effectiveDate = t('termsOfService.lastUpdated', { date: 'December 23, 2025' });

    const rawSections = t('termsOfService.sections', { returnObjects: true });
    // Ensure sections is an array to prevent crashes if translation is missing/malformed initially
    const sections = Array.isArray(rawSections) ? rawSections : [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{t('termsOfService.title')}</Text>
                        <Text style={styles.subtitle}>{effectiveDate}</Text>
                    </View>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {sections.map((section: any, index: number) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E9EFF5'
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: wp(4),
        paddingBottom: hp(4),
    },
    headerCard: {
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(6),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: wp(3),
        elevation: 5,
    },
    backButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: wp(5),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        alignSelf: 'flex-start',
        marginBottom: hp(2),
    },
    backButtonText: {
        fontSize: wp(4),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: wp(7),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        marginBottom: hp(1),
        textAlign: 'center',
        paddingHorizontal: wp(4),
    },
    subtitle: {
        fontSize: wp(4),
        color: '#4A5565',
        textAlign: 'center',
    },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: wp(3),
        elevation: 5,
    },
    section: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        marginBottom: hp(1.5),
    },
    sectionContent: {
        fontSize: wp(3.8),
        fontFamily: fonts.inter.regular,
        color: '#4A5565',
        lineHeight: hp(2.5),
    },
});