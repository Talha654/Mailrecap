import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput } from '../components';
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

    const onLogin = async () => {
        if (loading) return;
        if (!email.trim() || !password) {
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailPassword(email, password);
            navigation.navigate(SCREENS.HOME);
        } catch (e) {
            // TODO: surface error to UI (toast/snackbar)
            console.warn('Login failed', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <SafeAreaView style={styles.container}>

                <Text style={styles.heading}>Mailrecap</Text>

                <View style={styles.content}>
                    <Text style={styles.title}>{t('auth.login')}</Text>
                    <View style={styles.spacerLarge} />
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
                        returnKeyType="done"
                    />
                    <View style={styles.linkRow}>
                        <TouchableOpacity>
                            <Text style={styles.link}>{t('auth.forgot')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.spacerLarge} />
                    <CustomButton title={t('auth.login')} onPress={onLogin} loading={loading} />
                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{t('auth.noAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.SIGNUP)}>
                            <Text style={styles.link}>{t('auth.signup')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </KeyboardAvoidingView>
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
    linkRow: {
        alignItems: 'flex-end',
        marginTop: hp(1),
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


