import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput, showSuccessToast, showErrorToast, PrivacyModal } from '../components';
import { hp, wp } from '../constants/StyleGuide';
import { SCREENS } from '../navigation';
import { RootStackNavigationProp } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUpWithEmailPassword } from '../services/auth';

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
            showErrorToast('Email Required', 'Please enter your email address');
            return;
        }
        if (!password) {
            showErrorToast('Password Required', 'Please enter a password');
            return;
        }
        if (password !== confirmPassword) {
            showErrorToast('Password Mismatch', 'Passwords do not match');
            return;
        }
        if (!agreedToTerms) {
            showErrorToast('Terms Required', 'Please agree to the terms and conditions');
            return;
        }
        
        setLoading(true);
        try {
            await signUpWithEmailPassword(email, password, name || undefined);
            showSuccessToast('Account Created Successfully', 'Welcome to MailRecap!');
            // Show privacy modal after successful signup
            setShowPrivacyModal(true);
        } catch (e: any) {
            console.warn('Signup failed', e);
            const errorMessage = e?.message || 'An error occurred during signup';
            showErrorToast('Signup Failed', errorMessage);
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

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingHorizontal: wp(6), paddingBottom: hp(4) }}>

                    {/* Mail Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.mailIcon}>✉</Text>
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
                                {t('auth.agreeToTerms')} <Text style={styles.termsLink}>{t('auth.termsOfService')}</Text>
                                {' '}{t('auth.and')} <Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
                            </Text>
                        </TouchableOpacity>
                        <CustomButton title={t('auth.createAccount')} onPress={onSignup} loading={loading} />

                        {/* Social Login Buttons */}

     {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtonsRow}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>G</Text>
                                <Text style={styles.socialButtonLabel}>{t('auth.google')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.appleIcon}></Text>
                                <Text style={styles.socialButtonLabel}>{t('auth.apple')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{t('auth.haveAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.link}>{t('auth.login')}</Text>
                        </TouchableOpacity>
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
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: wp(10),
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: hp(4),
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: hp(3),
    },
    iconCircle: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mailIcon: {
        fontSize: wp(10),
        color: '#5B8DEF',
    },
    content: {
        flex: 1,
        borderRadius: wp(6),
        borderWidth: 1,
        borderColor: '#E4E4E4',
        padding: wp(6),
    },
    title: {
        fontSize: wp(7),
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(4),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: hp(4),
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
        borderColor: '#E5E7EB',
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
    link: {
        color: '#2563EB',
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
});

export default SignupScreen;


