import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import ht from './locales/ht.json';

const LANGUAGE_DETECTOR = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lng: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage) {
                callback(savedLanguage);
            } else {
                // Default to English if no language is saved
                callback('en');
            }
        } catch (error) {
            console.log('Error reading language from storage', error);
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) {
            console.log('Error saving language to storage', error);
        }
    },
};

i18n
    .use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        fallbackLng: 'en',
        debug: __DEV__,
        resources: {
            en: {
                translation: en,
            },
            es: {
                translation: es,
            },
            ht: {
                translation: ht,
            },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
