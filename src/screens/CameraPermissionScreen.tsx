import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { CustomButton } from '../components/ui/CustomButton';
import { wp, hp } from '../constants/StyleGuide';
import { SCREENS } from '../navigation';
import { useNavigation } from '@react-navigation/native';

export const CameraPermissionScreen: React.FC = () => {
    const { t } = useTranslation();

    const navigation: any = useNavigation();

    return (
        <LinearGradient
            colors={['#BFDBFE', '#93C5FD', '#DDD6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={['#60A5FA', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconContainer}
                        >
                            <Text style={styles.iconText}>📷</Text>
                        </LinearGradient>
                        <Text style={styles.title}>
                            {t('cameraPermission.title')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('cameraPermission.subtitle')}
                        </Text>
                        <Text style={styles.explanation}>
                            {t('cameraPermission.explanation')}
                        </Text>
                    </View>

                    {/* Permission Cards */}
                    <View style={styles.permissionsContainer}>
                        <View style={styles.permissionCard}>
                            <View style={styles.permissionContent}>
                                <View style={styles.permissionIconContainer}>
                                    <Text style={styles.permissionIcon}>📷</Text>
                                </View>
                                <View style={styles.permissionText}>
                                    <Text style={styles.permissionTitle}>
                                        {t('cameraPermission.cameraTitle')}
                                    </Text>
                                    <Text style={styles.permissionDesc}>
                                        {t('cameraPermission.cameraDesc')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.permissionCardGreen}>
                            <View style={styles.permissionContent}>
                                <View style={styles.permissionIconContainerGreen}>
                                    <Text style={styles.permissionIcon}>📱</Text>
                                </View>
                                <View style={styles.permissionText}>
                                    <Text style={styles.permissionTitle}>
                                        {t('cameraPermission.photosTitle')}
                                    </Text>
                                    <Text style={styles.permissionDesc}>
                                        {t('cameraPermission.photosDesc')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Disclaimer */}
                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>
                            {t('cameraPermission.disclaimer')}
                        </Text>
                    </View>

                    {/* Allow Button */}
                    <CustomButton
                        title={t('cameraPermission.allow')}
                        onPress={() => { navigation.navigate(SCREENS.CAMERA_SCREEN); }}
                        style={styles.button}
                    />

                    {/* Privacy Text */}
                    <Text style={styles.privacyText}>
                        {t('cameraPermission.privacy')}
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
        paddingVertical: hp(4),
    },
    card: {
        width: '100%',
        maxWidth: wp(90),
        backgroundColor: '#FFFFFF',
        borderRadius: wp(8),
        padding: wp(6),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: hp(3),
    },
    iconContainer: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    iconText: {
        fontSize: wp(8),
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: hp(1.5),
    },
    subtitle: {
        fontSize: wp(4),
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: hp(1.5),
        lineHeight: wp(5.5),
    },
    explanation: {
        fontSize: wp(3.5),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: wp(4.5),
    },
    permissionsContainer: {
        marginBottom: hp(2.5),
    },
    permissionCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
    },
    permissionCardGreen: {
        backgroundColor: '#F0FDF4',
        borderRadius: wp(4),
        padding: wp(4),
    },
    permissionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    permissionIconContainer: {
        width: wp(10),
        height: wp(10),
        backgroundColor: '#DBEAFE',
        borderRadius: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    permissionIconContainerGreen: {
        width: wp(10),
        height: wp(10),
        backgroundColor: '#DCFCE7',
        borderRadius: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    permissionIcon: {
        fontSize: wp(5),
    },
    permissionText: {
        flex: 1,
    },
    permissionTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: hp(0.3),
    },
    permissionDesc: {
        fontSize: wp(3.5),
        color: '#4B5563',
    },
    disclaimerContainer: {
        backgroundColor: '#FEFCE8',
        borderWidth: 1,
        borderColor: '#FEF08A',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2.5),
    },
    disclaimerText: {
        fontSize: wp(3),
        color: '#374151',
        lineHeight: wp(4.2),
    },
    button: {
        marginBottom: hp(1.5),
        paddingVertical: hp(1.3),
    },
    privacyText: {
        fontSize: wp(3),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: wp(4.2),
    },
});