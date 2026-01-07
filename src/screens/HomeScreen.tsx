import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../constants/StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import Icon from 'react-native-vector-icons/Feather';
import { icons, images } from '../constants/images';
import { fonts } from '../constants/fonts';
import { useSubscription } from '../hooks/useSubscription';

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const { subscriptionPlan, scansLeft, daysLeft } = useSubscription();

    const handleSubscribe = () => {
        navigation.navigate(SCREENS.SUBSCRIPTION_PLAN);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Logo and Tagline */}
                    <View style={styles.logoSection}>
                        <Image source={images.home_logo} resizeMode='contain' style={styles.homeLogo} />
                    </View>

                    {/* Scan Mail Button */}
                    <View style={styles.scanSection}>
                        <TouchableOpacity
                            onPress={() => {
                                if (subscriptionPlan === 'no_plan') {
                                    Alert.alert(t('common.error'), t('errors.noPlanError'));
                                    return;
                                }
                                navigation.navigate(SCREENS.CAMERA_SCREEN);
                            }}
                            activeOpacity={0.8}
                            style={styles.cameraIconContainer}>
                            <Image source={icons.camera} resizeMode='contain' style={styles.cameraIcon} />
                        </TouchableOpacity>
                        <Text style={styles.scanMailText}>{t('home.scanMail')}</Text>
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSectionContainer}>
                    {/* Strip Image */}
                    <Image
                        source={images.bottom_img}
                        style={styles.bottomStripImage}
                        resizeMode="contain"
                    />

                    {/* Info Bar (Grey) */}
                    <View style={styles.infoBar}>
                        {subscriptionPlan === 'free_trial' && (
                            <>
                                <Text style={styles.infoBarText}>{t('home.plan.freeTrial')}</Text>
                                <Text style={styles.infoBarText}>{t('home.plan.daysLeft', { count: daysLeft ?? 7 })}</Text>
                            </>
                        )}
                        {(subscriptionPlan === 'essentials_monthly' || subscriptionPlan === 'essentials_yearly') && (
                            <>
                                <Text style={styles.infoBarText}>{subscriptionPlan === 'essentials_yearly' ? 'Essentials Yearly' : t('home.plan.essentials')}</Text>
                                <Text style={styles.infoBarText}>{t('home.plan.scansLeft', { count: scansLeft ?? 10 })}</Text>
                            </>
                        )}
                        {(subscriptionPlan === 'plus_monthly' || subscriptionPlan === 'plus_yearly') && (
                            <>
                                <Text style={styles.infoBarText}>{t('home.plan.plus')}</Text>
                                <Text style={styles.infoBarText}>{t('home.plan.unlimited')}</Text>
                            </>
                        )}
                        {subscriptionPlan === 'no_plan' && (
                            <Text style={styles.infoBarText}>{t('home.plan.noPlan')}</Text>
                        )}
                    </View>

                    {/* Dark Blue Area */}
                    <View style={styles.darkBlueArea}>
                        {/* Subscribe Button (Hidden for Unlimited?) - Image shows it for Free Trial and Essentials */}
                        {/* {subscriptionPlan !== 'plus_monthly' && subscriptionPlan !== 'plus_yearly' && (
                            <TouchableOpacity
                                onPress={handleSubscribe}
                                activeOpacity={0.8}
                                style={styles.subscribeButton}
                            >
                                <Text style={styles.subscribeButtonText}>{t('mailSummary.subscribe')}</Text>
                            </TouchableOpacity>
                        )} */}
                        {/* Spacer if no subscribe button to keep nav at bottom? No, flex space-between in darkBlueArea */}

                        {/* Navigation Row */}
                        <View style={styles.navigationRow}>
                            <TouchableOpacity
                                style={[styles.navButton, { borderRightWidth: 2 }]}
                                onPress={() => navigation.navigate(SCREENS.ARCHIVE)}
                                activeOpacity={0.7}
                            >
                                <Icon name="folder" size={wp(8)} color="#FFFFFF" />
                                <Text style={styles.navButtonText}>{t('home.navArchive')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navButton, { borderLeftWidth: 2 }]}
                                onPress={() => navigation.navigate(SCREENS.SETTINGS)}
                                activeOpacity={0.7}
                            >
                                <Icon name="user" size={wp(8)} color="#FFFFFF" />
                                <Text style={styles.navButtonText}>{t('home.navProfile')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E8EAED',
    },
    container: {
        flex: 1,
        backgroundColor: '#E8EAED',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: hp(5),
    },
    logoSection: {
        alignItems: 'center',
        paddingTop: hp(3),
    },
    homeLogo: {
        width: wp(70),
        height: hp(13),
        marginBottom: hp(2),
    },
    scanSection: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cameraIconContainer: {
        width: wp(35),
        height: wp(35),
        backgroundColor: '#D6212F',
        borderRadius: wp(35),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    cameraIcon: {
        width: wp(18),
        height: wp(18),
    },
    scanMailText: {
        fontSize: wp(9),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
        color: '#000F54',
    },
    bottomSectionContainer: {
        width: '100%',
    },
    bottomStripImage: {
        width: '100%',
        height: hp(1.5),
        marginBottom: -1, // Fix potential gap
    },
    infoBar: {
        backgroundColor: '#B1BDC8', // Greyish blue from image
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        alignItems: 'center',
    },
    infoBarText: {
        fontSize: wp(4.5),
        fontFamily: Platform.OS === 'ios' ? fonts.sourceSerif.semiBold : fonts.sourceSerif.semiBoldItalic,
        fontStyle: Platform.OS === 'ios' ? 'italic' : 'normal',
        color: '#000F54',
    },
    darkBlueArea: {
        backgroundColor: '#000F54',
        // paddingTop: hp(2),
        // paddingBottom: hp(3),
    },
    subscribeButton: {
        alignSelf: 'center',
        marginBottom: hp(3),
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: wp(5),
        fontFamily: fonts.sourceSerif.bold,
        fontStyle: 'italic',
    },
    navigationRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    navButton: {
        alignItems: 'center',
        // justifyContent: 'center',
        paddingVertical: hp(2),
        flex: 1,
    },
    navButtonText: {
        fontSize: wp(3),
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: hp(0.5),
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    // navDivider: {
    //     width: 1,
    //     // height: hp(5),
    //     backgroundColor: '#000C43',
    // },
});