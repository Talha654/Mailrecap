import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    HomeScreen,
    ProfileScreen,
    SettingsScreen,
    WelcomeScreen,
    LoginScreen,
    SignupScreen,
    LanguageSelectionScreen,
    PrivacyTermsScreen,
    SubscriptionPlanScreen,
    CameraPermissionScreen,
    CameraScreen,
    MailSummaryScreen,
    PrivacyPolicyScreen,
    TermsOfServiceScreen,
    ArchiveScreen,
} from '../screens';
import { SCREENS } from './screens';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={SCREENS.LOGIN}
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#007AFF',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name={SCREENS.HOME}
                    component={HomeScreen}
                />
                <Stack.Screen
                    name={SCREENS.PROFILE}
                    component={ProfileScreen}
                />
                <Stack.Screen
                    name={SCREENS.SETTINGS}
                    component={SettingsScreen}
                />
                <Stack.Screen
                    name={SCREENS.WELCOME}
                    component={WelcomeScreen}
                />
                <Stack.Screen
                    name={SCREENS.LOGIN}
                    component={LoginScreen}
                />
                <Stack.Screen
                    name={SCREENS.SIGNUP}
                    component={SignupScreen}
                />
                <Stack.Screen
                    name={SCREENS.LANGUAGE_SELECTION}
                    component={LanguageSelectionScreen}
                />
                <Stack.Screen
                    name={SCREENS.PRIVACY_TERMS}
                    component={PrivacyTermsScreen}
                />
                <Stack.Screen
                    name={SCREENS.PRIVACY_POLICY}
                    component={PrivacyPolicyScreen}
                />
                <Stack.Screen
                    name={SCREENS.TERMS_OF_SERVICE}
                    component={TermsOfServiceScreen}
                />
                <Stack.Screen
                    name={SCREENS.SUBSCRIPTION_PLAN}
                    component={SubscriptionPlanScreen}
                />
                <Stack.Screen
                    name={SCREENS.CAMERA_PERMISSION}
                    component={CameraPermissionScreen}
                />
                <Stack.Screen
                    name={SCREENS.CAMERA_SCREEN}
                    component={CameraScreen}
                />
                <Stack.Screen
                    name={SCREENS.MAIL_SUMMARY}
                    component={MailSummaryScreen}
                />
                <Stack.Screen
                    name={SCREENS.ARCHIVE}
                    component={ArchiveScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
