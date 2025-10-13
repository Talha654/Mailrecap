
export const SCREENS = {
    HOME: 'Home',
    PROFILE: 'Profile',
    SETTINGS: 'Settings',
    WELCOME: 'Welcome',
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    LANGUAGE_SELECTION: 'LanguageSelection',
    PRIVACY_TERMS: 'PrivacyTerms',
    PRIVACY_POLICY: 'PrivacyPolicy',
    TERMS_OF_SERVICE: 'TermsOfService',
    SUBSCRIPTION_PLAN: 'SubscriptionPlan',
    CAMERA_PERMISSION: 'CameraPermission',
    CAMERA_SCREEN: 'CameraScreen',
    MAIL_SUMMARY: 'MailSummary',
    ARCHIVE: 'Archive',
} as const;

// Screen names as type for better type safety
export type ScreenName = typeof SCREENS[keyof typeof SCREENS];
