import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput } from '../components';
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

    const onSignup = async () => {
        if (loading) return;
        if (!email.trim() || !password || password !== confirmPassword) {
            return;
        }
        setLoading(true);
        try {
            await signUpWithEmailPassword(email, password, name || undefined);
            navigation.navigate(SCREENS.HOME);
        } catch (e) {
            console.warn('Signup failed', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <ScrollView>
                    <Text style={styles.heading}>Mailrecap</Text>
                    <View style={styles.content}>
                        <Text style={styles.title}>{t('auth.signup')}</Text>
                        <View style={styles.spacerLarge} />
                        <CustomInput
                            label={t('auth.name')}
                            placeholder='Enter Name'
                            value={name}
                            onChangeText={setName}
                            returnKeyType="next"
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.email')}
                            placeholder='Enter Email'
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.password')}
                            placeholder='Enter Password'
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="next"
                        />
                        <View style={styles.spacer} />
                        <CustomInput
                            label={t('auth.confirmPassword')}
                            placeholder='Enter Confirm Password'
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            returnKeyType="done"
                        />
                        <View style={styles.spacerLarge} />
                        <CustomButton title={t('auth.signup')} onPress={onSignup} loading={loading} />
                        <View style={styles.switchRow}>
                            <Text style={styles.switchText}>{t('auth.haveAccount')} </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.link}>{t('auth.login')}</Text>
                            </TouchableOpacity>
                        </View>
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
    heading: {
        fontSize: wp(10),
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: hp(4),
    },
    content: {
        flex: 1,
        paddingHorizontal: wp(6),
        paddingTop: hp(8),
    },
    title: {
        fontSize: wp(8),
        fontWeight: '800',
        color: '#111827',
    },
    spacer: {
        height: hp(2),
    },
    spacerLarge: {
        height: hp(3),
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


