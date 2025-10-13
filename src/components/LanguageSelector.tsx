import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../constants/StyleGuide';

interface LanguageSelectorProps {
    onLanguageChange?: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
    const { t, i18n } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const languages = [
        { code: 'en', name: t('settings.english'), flag: '🇺🇸' },
        { code: 'es', name: t('settings.spanish'), flag: '🇪🇸' },
        { code: 'ht', name: t('settings.haitianCreole'), flag: '🇭🇹' },
    ];

    const changeLanguage = async (languageCode: string) => {
        try {
            await i18n.changeLanguage(languageCode);
            setIsModalVisible(false);
            onLanguageChange?.(languageCode);
        } catch (error) {
            console.log('Error changing language:', error);
        }
    };

    const getCurrentLanguage = () => {
        return languages.find(lang => lang.code === i18n.language) || languages[0];
    };

    return (
        <>
            <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setIsModalVisible(true)}
            >
                <Text style={styles.selectorText}>
                    {getCurrentLanguage().flag} {getCurrentLanguage().name}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>

                        {languages.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.languageOption,
                                    i18n.language === language.code && styles.selectedLanguage
                                ]}
                                onPress={() => changeLanguage(language.code)}
                            >
                                <Text style={[
                                    styles.languageText,
                                    i18n.language === language.code && styles.selectedLanguageText
                                ]}>
                                    {language.flag} {language.name}
                                </Text>
                                {i18n.language === language.code && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    selectorText: {
        fontSize: wp(4),
        color: '#374151',
        fontWeight: '500',
    },
    arrow: {
        fontSize: wp(3),
        color: '#6b7280',
        marginLeft: wp(2),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(5),
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(6),
        width: '100%',
        maxWidth: wp(90),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(1) },
        shadowOpacity: 0.25,
        shadowRadius: wp(4),
        elevation: 8,
    },
    modalTitle: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(3),
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        marginBottom: hp(1),
        backgroundColor: '#f9fafb',
    },
    selectedLanguage: {
        backgroundColor: '#a78bfa',
    },
    languageText: {
        fontSize: wp(4.5),
        color: '#374151',
        fontWeight: '500',
    },
    selectedLanguageText: {
        color: '#fff',
    },
    checkmark: {
        fontSize: wp(4),
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: hp(2),
        paddingVertical: hp(1.5),
        alignItems: 'center',
        backgroundColor: '#ef4444',
        borderRadius: wp(2),
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: '600',
    },
});
