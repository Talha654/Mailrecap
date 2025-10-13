import { SCREENS } from '../navigation/screens';
import { MailItem } from './mail';

// Define the parameter list for all screens in the stack navigator
export type RootStackParamList = {
    [SCREENS.HOME]: undefined;
    [SCREENS.PROFILE]: undefined;
    [SCREENS.SETTINGS]: undefined;
    [SCREENS.WELCOME]: undefined;
    [SCREENS.LOGIN]: undefined;
    [SCREENS.SIGNUP]: undefined;
    [SCREENS.LANGUAGE_SELECTION]: undefined;
    [SCREENS.PRIVACY_TERMS]: undefined;
    [SCREENS.PRIVACY_POLICY]: undefined;
    [SCREENS.TERMS_OF_SERVICE]: undefined;
    [SCREENS.SUBSCRIPTION_PLAN]: undefined;
    [SCREENS.CAMERA_PERMISSION]: undefined;
    [SCREENS.CAMERA_SCREEN]: undefined;
    [SCREENS.MAIL_SUMMARY]: { mailItem: MailItem };
    [SCREENS.ARCHIVE]: undefined;
};

// Screen names as constants for type safety
export type RootStackScreenNames = keyof RootStackParamList;

// Navigation prop types
export type RootStackNavigationProp<T extends keyof RootStackParamList> =
    import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    import('@react-navigation/native-stack').NativeStackScreenProps<RootStackParamList, T>;

// Common navigation types
export type NavigationProp = import('@react-navigation/native').NavigationProp<RootStackParamList>;
export type RouteProp<T extends keyof RootStackParamList> =
    import('@react-navigation/native').RouteProp<RootStackParamList, T>;
