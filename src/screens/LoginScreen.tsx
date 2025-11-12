import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput, showSuccessToast } from '../components';
import { hp, wp } from '../constants/StyleGuide';
import { SCREENS } from '../navigation';
import { RootStackNavigationProp } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailPassword } from '../services/auth';

type Props = {
    navigation: RootStackNavigationProp<typeof SCREENS.LOGIN>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const onLogin = async () => {
        if (loading) return;
        if (!email.trim() || !password) {
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailPassword(email, password);
            // navigation.replace(SCREENS.HOME);
            navigation.navigate(SCREENS.HOME);
            showSuccessToast('Login successful');
        } catch (e) {
            // TODO: surface error to UI (toast/snackbar)
            console.warn('Login failed', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Mail Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.mailIcon}>✉</Text>
                        </View>
                    </View>

                    {/* Title and Subtitle */}
                    <Text style={styles.title}>{t('auth.loginTitle')}</Text>
                    <Text style={styles.subtitle}>{t('auth.startFreeScan')}</Text>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        {/* Email Address */}
                        <Text style={styles.label}>{t('auth.emailAddress')}</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>✉</Text>
                            <View style={styles.inputContainer}>
                                <CustomInput
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    inputStyle={styles.input}
                                    containerStyle={styles.inputWrapper}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <Text style={styles.label}>{t('auth.password')}</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <View style={styles.inputContainer}>
                                <CustomInput
                                    placeholder={t('auth.passwordPlaceholder')}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    returnKeyType="done"
                                    inputStyle={styles.input}
                                    containerStyle={styles.inputWrapper}
                                />
                            </View>
                        </View>
                        <Text style={styles.hint}>{t('auth.passwordHint')}</Text>

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

                        {/* Login Button */}
                        <CustomButton 
                            title={t('auth.loginTitle')} 
                            onPress={onLogin} 
                            loading={loading}
                            style={styles.loginButton}
                        />

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Social Login Buttons */}
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
                            <Text style={styles.switchText}>{t('auth.noAccount')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.SIGNUP)}>
                                <Text style={styles.link}>{t('auth.signup')}</Text>
                            </TouchableOpacity>
                        </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp(6),
        paddingBottom: hp(4),
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(2),
        marginBottom: hp(3),
    },
    backArrow: {
        fontSize: wp(6),
        color: '#000',
        marginRight: wp(2),
    },
    backText: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#000',
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
    title: {
        fontSize: wp(7.5),
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: wp(4),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: hp(4),
    },
    formContainer: {
        borderRadius: wp(6),
        borderWidth:1,
        borderColor:'#E4E4E4',
        padding: wp(6),
    },
    label: {
        fontSize: wp(4),
        fontWeight: '600',
        color: '#111827',
        marginBottom: hp(1),
        marginTop: hp(2),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    inputIcon: {
        fontSize: wp(5),
        color: '#9CA3AF',
        marginRight: wp(3),
    },
    inputContainer: {
        flex: 1,
    },
    inputWrapper: {
        width: '100%',
    },
    input: {
        backgroundColor: '#F9FAFC',
        borderColor: '#E5E7EB',
        borderRadius:wp(6),
    },
    hint: {
        fontSize: wp(3.2),
        color: '#9CA3AF',
        marginBottom: hp(2),
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
    loginButton: {
        marginTop: hp(2),
        borderRadius: wp(8),
        paddingVertical: hp(2),
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

export default LoginScreen;


