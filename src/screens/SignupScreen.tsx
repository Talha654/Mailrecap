import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput, showSuccessToast, showErrorToast, PrivacyModal } from '../components';
import { hp, wp } from '../constants/StyleGuide';
import { SCREENS } from '../navigation';
import { RootStackNavigationProp } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUpWithEmailPassword, signInWithGoogle, signInWithApple } from '../services/auth';
import { fonts } from '../constants/fonts';
import { icons, images } from '../constants/images';
import { AppleIcon, GoogleIcon } from '../components/SocialIcons';

type Props = {
    navigation: RootStackNavigationProp<typeof SCREENS.SIGNUP>;
};

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [shouldShowModalOnReturn, setShouldShowModalOnReturn] = useState(false);

    // Re-show modal when returning from Privacy Policy screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (shouldShowModalOnReturn) {
                setShowPrivacyModal(true);
                setShouldShowModalOnReturn(false);
            }
        });

        return unsubscribe;
    }, [navigation, shouldShowModalOnReturn]);

    const onSignup = async () => {
        if (loading) return;

        // Validation
        if (!email.trim()) {
            showErrorToast(t('auth.emailRequired'), t('auth.enterEmail'));
            return;
        }
        if (!password) {
            showErrorToast(t('auth.passwordRequired'), t('auth.enterPassword'));
            return;
        }
        if (password !== confirmPassword) {
            showErrorToast(t('auth.passwordMismatch'), t('auth.passwordsDoNotMatch'));
            return;
        }
        if (!agreedToTerms) {
            showErrorToast(t('auth.termsRequired'), t('auth.agreeTerms'));
            return;
        }

        setLoading(true);
        try {
            await signUpWithEmailPassword(email, password, name || undefined);
            showSuccessToast(t('auth.accountCreated'), t('auth.welcomeMessage'));
            // Show privacy modal after successful signup
            setShowPrivacyModal(true);
        } catch (e: any) {
            console.warn('Signup failed', e);
            const errorMessage = e?.message || t('auth.signupError');
            showErrorToast(t('auth.signupFailed'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyModalClose = () => {
        setShowPrivacyModal(false);
        navigation.navigate(SCREENS.LOGIN);
    };

    const handleViewPrivacyPolicy = () => {
        setShowPrivacyModal(false);
        setShouldShowModalOnReturn(true);
        navigation.navigate(SCREENS.PRIVACY_POLICY);
    };

    const onGoogleSignup = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await signInWithGoogle();
            navigation.replace(SCREENS.HOME);
            showSuccessToast(t('auth.loginSuccess')); // Or a signup specific message if available
        } catch (e: any) {
            console.warn('Google Signup failed', e);
            showErrorToast(t('auth.signupFailed'), e.message || t('auth.unknownError'));
        } finally {
            setLoading(false);
        }
    };

    const onAppleSignup = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await signInWithApple();
            navigation.replace(SCREENS.HOME);
            showSuccessToast(t('auth.loginSuccess'));
        } catch (e: any) {
            console.warn('Apple Signup failed', e);
            if (e.code === '1001') {
                // User cancelled
            } else {
                showErrorToast(t('auth.signupFailed'), e.message || t('auth.unknownError'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingHorizontal: wp(6), paddingBottom: hp(12) }} showsVerticalScrollIndicator={false}>


                    {/* Mail Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Image source={icons.mail} style={styles.icon} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Title and Subtitle */}
                    <Text style={styles.title}>{t('auth.signupTitle')}</Text>
                    <Text style={styles.subtitle}>{t('auth.startFreeScan')}</Text>

                    {/* Form */}
                    <View style={styles.content}>
                        <View style={styles.spacerLarge} />
                        <CustomInput
                            label={t('auth.name')}
                            placeholder={t('auth.namePlaceholder')}
                            value={name}
                            onChangeText={setName}
                            returnKeyType="next"
                            inputStyle={styles.input}
                            containerStyle={styles.inputWrapper}
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.email')}
                            placeholder={t('auth.emailPlaceholderAlt')}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                            inputStyle={styles.input}
                            containerStyle={styles.inputWrapper}
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.password')}
                            placeholder={t('auth.passwordPlaceholderAlt')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="next"
                            inputStyle={styles.input}
                            containerStyle={styles.inputWrapper}
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.confirmPassword')}
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            returnKeyType="done"
                            inputStyle={styles.input}
                            containerStyle={styles.inputWrapper}
                        />
                        {/* Terms Checkbox */}
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setAgreedToTerms(!agreedToTerms)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.termsText}>
                                {t('auth.agreeToTerms')} <Text style={styles.termsLink} onPress={() => navigation.navigate(SCREENS.TERMS_OF_SERVICE)}>{t('auth.termsOfService')}</Text>
                                {' '}{t('auth.and')} <Text style={styles.termsLink} onPress={() => navigation.navigate(SCREENS.PRIVACY_POLICY)}>{t('auth.privacyPolicy')}</Text>
                            </Text>
                        </TouchableOpacity>
                        {/* signup button */}
                        <CustomButton
                            title={t('auth.createAccount')}
                            onPress={onSignup}
                            loading={loading}
                            style={styles.signupButton}
                        />

                        {/* Social Login Buttons */}

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtonsRow}>
                            <TouchableOpacity style={styles.socialButton} onPress={onGoogleSignup} disabled={loading}>
                                <GoogleIcon width={wp(5)} height={wp(5)} />
                                <Text style={styles.socialButtonLabel}>{t('auth.google')}</Text>
                            </TouchableOpacity>
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    onPress={onAppleSignup}
                                    style={styles.socialButton}
                                    disabled={loading}>
                                    <AppleIcon width={wp(5)} height={wp(5)} />
                                    <Text style={styles.socialButtonLabel}>{t('auth.apple')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{t('auth.haveAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.link}>{t('auth.login')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Image */}
                    <View style={styles.bottomImageContainer}>
                        <Image
                            source={images.bottom_img}
                            style={styles.bottomImage}
                            resizeMode="contain"
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>



            {/* Privacy Modal */}
            <PrivacyModal
                visible={showPrivacyModal}
                onClose={handlePrivacyModalClose}
                onViewPolicy={handleViewPrivacyPolicy}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EFF5',
    },
    heading: {
        fontSize: wp(10),
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: hp(4),
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: hp(2),
        marginTop: hp(2)
    },
    iconCircle: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        backgroundColor: '#D6212F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: wp(15),
        height: wp(15),
    },
    content: {
        flex: 1,
        borderRadius: wp(6),
        borderWidth: 1,
        borderColor: '#c1bebeff',
        padding: wp(6),
    },
    title: {
        fontSize: wp(7),
        fontWeight: '700',
        color: '#000F54',
        textAlign: 'center',
        fontFamily: fonts.sourceSerif.bold,
    },
    subtitle: {
        fontSize: wp(4),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: hp(4),
        fontFamily: fonts.inter.regular,
    },
    spacer: {
        height: hp(2),
    },
    spacerLarge: {
        height: hp(3),
    },
    inputWrapper: {
        width: '100%',
    },
    input: {
        backgroundColor: '#F9FAFC',
        borderColor: '#E5E7EB',
        borderRadius: wp(10),
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp(3),
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: wp(3.5),
        color: '#9CA3AF',
        marginHorizontal: wp(3),
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(3),
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: wp(8),
        paddingVertical: hp(1.8),
        borderWidth: 1,
        borderColor: '#000F54',
    },
    socialButtonText: {
        fontSize: wp(5),
        fontWeight: '700',
        color: '#000',
        marginRight: wp(2),
    },
    socialButtonLabel: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#111827',
        marginLeft: wp(2),
    },
    appleIcon: {
        fontSize: wp(5),
        color: '#000',
        marginRight: wp(2),
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp(2),
    },
    checkbox: {
        width: wp(5),
        height: wp(5),
        borderRadius: wp(1),
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
        marginRight: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        borderColor: '#5B8DEF',
        backgroundColor: '#E8F0FE',
    },
    checkmark: {
        fontSize: wp(3.5),
        color: '#5B8DEF',
        fontWeight: '700',
    },
    termsText: {
        fontSize: wp(3.5),
        color: '#6B7280',
        flex: 1,
    },
    termsLink: {
        color: '#5B8DEF',
        fontWeight: '600',
    },
    signupButton: {
        marginTop: hp(2),
        borderRadius: wp(8),
        paddingVertical: hp(2),
        width: '100%',
        fontFamily: fonts.inter.semiBold,
        backgroundColor: '#000F54'
    },
    link: {
        color: '#000F54',
        fontWeight: '600',
        fontSize: wp(3.6),
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    switchText: {
        color: '#6B7280',
        fontSize: wp(3.6),
    },
    bottomImageContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#E9EFF5',
    },
    bottomImage: {
        width: '110%',
        height: hp(7),
        alignSelf: 'center',
    },
});

export default SignupScreen;


