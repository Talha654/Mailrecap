import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Shield, Clock } from 'lucide-react-native';
import { wp, hp } from '../constants/StyleGuide';
import { useTranslation } from 'react-i18next';
import { SCREENS } from '../navigation';
import { RootStackNavigationProp } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { images } from '../constants/images';
import { fonts } from '../constants/fonts';
import { CustomButton, LanguageDropdown } from '../components';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type Props = {
    // navigation: RootStackNavigationProp<typeof SCREENS.SPLASH>;
};

export const SplashScreen: React.FC<Props> = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    // console.log('User logged in, redirecting to Home');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: SCREENS.HOME }],
                    });
                }
            } catch (error) {
                console.error('Error checking login state:', error);
            }
        };
        checkLogin();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.languageDropdownContainer}>
                <LanguageDropdown
                    selectedLanguage={i18n.language}
                    onSelect={handleLanguageChange}
                />
            </View>
            <View style={styles.content}>
                {/* Logo */}
                <Image source={images.welcome_logo} style={styles.logo} resizeMode="contain" />

                {/* Description */}
                <Text style={styles.tagline}>
                    {t('splash.tagline')}
                </Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <View style={styles.iconCircle}>
                            <Zap color="#FFFFFF" size={28} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.featureLabel}>{t('splash.instant')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.iconCircle}>
                            <Shield color="#FFFFFF" size={28} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.featureLabel}>{t('splash.private')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.iconCircle}>
                            <Clock color="#FFFFFF" size={28} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.featureLabel}>{t('splash.simple')}</Text>
                    </View>
                </View>

                {/* Get Started Button */}
                {/* <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>{t('splash.getStartedFree')}</Text>
                </TouchableOpacity> */}
                <CustomButton
                    title="Get Started Free"
                    onPress={() => navigation.navigate(SCREENS.LOGIN)}
                    // loading={loading}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
            </View>

            {/* Bottom Image */}
            <Image
                source={images.bottom_img}
                style={styles.bottomImage}
                resizeMode="contain"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EFF5',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        marginTop: hp(8),
        paddingHorizontal: wp(8),
    },
    logo: {
        width: wp(80),
        height: hp(12),
        marginBottom: hp(1),
    },
    tagline: {
        fontSize: wp(5.5),
        fontFamily: fonts.sourceSerif.regular,
        color: '#000F54',
        textAlign: 'center',
        marginVertical: hp(4)
    },
    desc: {
        fontSize: wp(4.5),
        fontFamily: fonts.sourceSerif.regular,
        color: '#000F54',
        marginBottom: hp(4),
        paddingHorizontal: wp(5),
        marginTop: hp(2),
        textAlign: 'center',
        lineHeight: wp(6.5),
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: hp(4),
        paddingHorizontal: wp(5),
    },
    featureItem: {
        alignItems: 'center',
        gap: hp(1.5),
    },
    iconCircle: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: '#D6212F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureLabel: {
        fontSize: wp(4.2),
        fontFamily: fonts.sourceSerif.semiBold,
        color: '#000F54',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#000F54',
        paddingVertical: hp(2),
        paddingHorizontal: wp(12),
        borderRadius: wp(8),
        marginTop: hp(2),
    },
    buttonText: {
        fontSize: wp(4.5),
        fontFamily: fonts.sourceSerif.semiBold,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    bottomImage: {
        width: '110%',
        height: hp(8),
        position: 'absolute',
        alignSelf: 'center',
        bottom: 0,
    },
    languageDropdownContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: wp(5),
        marginTop: hp(2),
        zIndex: 100, // Ensure it stays on top if needed, though Modal handles the dropdown list
    },
});

export default SplashScreen;