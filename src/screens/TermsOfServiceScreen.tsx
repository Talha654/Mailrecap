import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const TermsOfServiceScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    const sections = [
        {
            title: t('termsOfService.useOfService.title'),
            content: t('termsOfService.useOfService.content')
        },
        {
            title: t('termsOfService.noAdvice.title'),
            content: t('termsOfService.noAdvice.content')
        },
        {
            title: t('termsOfService.subscriptions.title'),
            content: t('termsOfService.subscriptions.content')
        },
        {
            title: t('termsOfService.userResponsibilities.title'),
            content: t('termsOfService.userResponsibilities.content')
        },
        {
            title: t('termsOfService.liability.title'),
            content: t('termsOfService.liability.content')
        },
        {
            title: t('termsOfService.changes.title'),
            content: t('termsOfService.changes.content')
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
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
                            <Text style={styles.subtitle}>{t('termsOfService.subtitle')}</Text>
                        </View>
                    </View>

                    {/* Content Card */}
                    <View style={styles.contentCard}>
                        {sections.map((section, index) => (
                            <View key={index} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionContent}>{section.content}</Text>
                            </View>
                        ))}
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
    gradient: {
        flex: 1,
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
        fontWeight: '600',
        color: '#1f2937',
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: wp(7),
        fontWeight: 'bold',
        color: '#1f2937',
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
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(1.5),
    },
    sectionContent: {
        fontSize: wp(3.8),
        color: '#4A5565',
        lineHeight: hp(3),
    },
});