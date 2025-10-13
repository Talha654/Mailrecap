import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../components/ui/CustomButton';
import { NavigationProp } from '../types/navigation';

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#BFDBFE', '#93C5FD', '#DDD6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.root}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{t('home.title')}</Text>
                            <Text style={styles.greeting}>{t('home.welcome')}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => navigation.navigate(SCREENS.SETTINGS)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.settingsIcon}>⚙️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Actions */}
                    <View style={styles.actionsContainer}>
                        {/* Take Photo Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>{t('home.takePhoto')}</Text>
                                    <Text style={styles.cardDescription}>
                                        {t('home.scanDescription')}
                                    </Text>
                                </View>
                                <LinearGradient
                                    colors={['#4ADE80', '#22C55E']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.cardIcon}
                                >
                                    <Text style={styles.cardIconEmoji}>📷</Text>
                                </LinearGradient>
                            </View>
                            <CustomButton
                                title={t('home.startScanning')}
                                onPress={() => navigation.navigate(SCREENS.CAMERA_SCREEN)}
                                style={styles.greenButton}
                                textStyle={styles.buttonText}
                            />
                        </View>

                        {/* Review Saved Mail Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>{t('home.reviewSaved')}</Text>
                                    <Text style={styles.cardDescription}>
                                        {t('home.archiveDescription')}
                                    </Text>
                                </View>
                                <LinearGradient
                                    colors={['#60A5FA', '#3B82F6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.cardIcon}
                                >
                                    <Text style={styles.cardIconEmoji}>📂</Text>
                                </LinearGradient>
                            </View>
                            <CustomButton
                                title={t('home.viewArchive')}
                                onPress={() => {
                                    navigation.navigate(SCREENS.ARCHIVE)
                                }}
                                style={styles.blueButton}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </View>

                    {/* Quick Stats Card */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>{t('home.thisMonth')}</Text>
                        <View style={styles.statsGrid}>
                            <View style={[styles.statItem, styles.purpleStatBg]}>
                                <Text style={styles.statNumber}>3</Text>
                                <Text style={styles.statLabel}>{t('home.lettersScanned')}</Text>
                            </View>
                            <View style={[styles.statItem, styles.greenStatBg]}>
                                <Text style={[styles.statNumber, styles.greenStatNumber]}>7</Text>
                                <Text style={styles.statLabel}>{t('home.remaining')}</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <LinearGradient
                                colors={['#A855F7', '#9333EA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.progressBar}
                            />
                        </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(3),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(3),
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(0.5),
    },
    greeting: {
        fontSize: wp(4),
        color: '#4b5563',
    },
    settingsButton: {
        width: wp(12),
        height: wp(12),
        backgroundColor: '#fff',
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.3) },
        shadowOpacity: 0.15,
        shadowRadius: wp(2),
        elevation: 5,
    },
    settingsIcon: {
        fontSize: wp(5.5),
    },
    actionsContainer: {
        marginBottom: hp(2.5),
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(2),
    },
    cardTextContainer: {
        flex: 1,
        marginRight: wp(3),
    },
    cardTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(0.8),
    },
    cardDescription: {
        fontSize: wp(3.5),
        color: '#4b5563',
        lineHeight: hp(2.2),
    },
    cardIcon: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.3) },
        shadowOpacity: 0.2,
        shadowRadius: wp(2),
        elevation: 4,
    },
    cardIconEmoji: {
        fontSize: wp(7),
    },
    greenButton: {
        backgroundColor: '#10B981',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    blueButton: {
        backgroundColor: '#3B82F6',
        borderRadius: wp(5),
        paddingVertical: hp(1.8),
    },
    buttonText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(5),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.12,
        shadowRadius: wp(3),
        elevation: 6,
    },
    statsTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(2),
    },
    statsGrid: {
        flexDirection: 'row',
        gap: wp(3),
        marginBottom: hp(2),
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(2),
        borderRadius: wp(5),
    },
    purpleStatBg: {
        backgroundColor: '#F3E8FF',
    },
    greenStatBg: {
        backgroundColor: '#DCFCE7',
    },
    statNumber: {
        fontSize: wp(7),
        fontWeight: 'bold',
        color: '#9333EA',
        marginBottom: hp(0.3),
    },
    greenStatNumber: {
        color: '#16A34A',
    },
    statLabel: {
        fontSize: wp(3.2),
        color: '#4b5563',
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: hp(1.2),
        backgroundColor: '#E5E7EB',
        borderRadius: hp(0.6),
        overflow: 'hidden',
    },
    progressBar: {
        width: '30%',
        height: '100%',
        borderRadius: hp(0.6),
    },
});