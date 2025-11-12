import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import Icon from 'react-native-vector-icons/Feather';

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.logoContainer}>
                                <Icon name="mail" size={wp(6)} color="#3B82F6" />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.title}>MailRecap</Text>
                                <Text style={styles.subtitle}>Your Smart Mail Assistant</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => navigation.navigate(SCREENS.SETTINGS)}
                            activeOpacity={0.7}
                        >
                            <Icon name="settings" size={wp(5.5)} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Free Scan Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={styles.badge}>
                            <Icon name="zap" size={wp(4)} color="#3B82F6" />
                            <Text style={styles.badgeText}>1 free scan available</Text>
                        </View>
                    </View>

                    {/* Main Scan Card */}
                    <View style={styles.mainCard}>
                        <View style={styles.cameraIconContainer}>
                            <Icon name="camera" size={wp(10)} color="#3B82F6" />
                        </View>
                        <Text style={styles.mainCardTitle}>Scan Mail</Text>
                        <Text style={styles.mainCardSubtitle}>Photo → AI summary in seconds</Text>
                        <TouchableOpacity
                            style={styles.startScanButton}
                            onPress={() => navigation.navigate(SCREENS.CAMERA_SCREEN)}
                            activeOpacity={0.8}
                        >
                            <Icon name="camera" size={wp(5)} color="#FFFFFF" />
                            <Text style={styles.startScanButtonText}>Start Scan</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Cards */}
                    <View style={styles.bottomCardsContainer}>
                        <TouchableOpacity
                            style={styles.bottomCard}
                            onPress={() => navigation.navigate(SCREENS.ARCHIVE)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bottomCardIconContainer}>
                                <Icon name="folder" size={wp(7)} color="#3B82F6" />
                            </View>
                            <Text style={styles.bottomCardTitle}>Archive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bottomCard}
                            onPress={() => navigation.navigate(SCREENS.SETTINGS)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bottomCardIconContainer}>
                                <Icon name="settings" size={wp(7)} color="#3B82F6" />
                            </View>
                            <Text style={styles.bottomCardTitle}>Settings</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Privacy Notice */}
                    <View style={styles.privacyNotice}>
                        <Text style={styles.privacyText}>🔒 Images delete in 24hrs • Data never sold</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(3),
        paddingTop: hp(1),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: wp(12),
        height: wp(12),
        backgroundColor: '#EBF1FF',
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    title: {
        fontSize: wp(5.5),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(0.3),
    },
    subtitle: {
        fontSize: wp(3.5),
        color: '#9CA3AF',
        fontWeight: '400',
    },
    settingsButton: {
        width: wp(10),
        height: wp(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        alignItems: 'center',
        marginBottom: hp(3),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        borderRadius: wp(6),
    },
    badgeText: {
        fontSize: wp(3.8),
        color: '#2E70FF',
        fontWeight: '600',
        marginLeft: wp(2),
    },
    mainCard: {
        backgroundColor: '#F0F5FF',
        borderWidth:1,
        borderColor:'#CDDBFF',
        borderRadius: wp(6),
        paddingVertical: hp(5),
        paddingHorizontal: wp(6),
        alignItems: 'center',
        marginBottom: hp(3),
    },
    cameraIconContainer: {
        width: wp(20),
        height: wp(20),
        backgroundColor: '#DBEAFE',
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
    },
    mainCardTitle: {
        fontSize: wp(5.5),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(1),
    },
    mainCardSubtitle: {
        fontSize: wp(3.8),
        color: '#6B7280',
        marginBottom: hp(3),
    },
    startScanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: wp(8),
        paddingVertical: hp(1.8),
        borderRadius: wp(6),
    },
    startScanButtonText: {
        fontSize: wp(4.2),
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: wp(2),
    },
    bottomCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
        gap: wp(4),
    },
    bottomCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: wp(5),
        paddingVertical: hp(4),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bottomCardIconContainer: {
        width: wp(14),
        height: wp(14),
        backgroundColor: '#EFF6FF',
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1.5),
    },
    bottomCardTitle: {
        fontSize: wp(4),
        fontWeight: '700',
        color: '#111827',
    },
    privacyNotice: {
        alignItems: 'center',
        paddingVertical: hp(2),
    },
    privacyText: {
        fontSize: wp(3.2),
        color: '#9CA3AF',
        textAlign: 'center',
    },
});