import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../constants/StyleGuide';
import { iapService } from '../services/iap.service';
import { PurchaseError } from '../types/iap';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';

type PlanType = 'monthly' | 'annual';

interface Plan {
    id: PlanType;
    name: string;
    price: string;
    period: string;
    isPopular?: boolean;
    savings?: string;
}

export const SubscriptionPlanScreen: React.FC = () => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const navigation: any = useNavigation();

    const plans: Plan[] = [
        { 
            id: 'monthly', 
            name: 'Monthly',
            price: '$4.99',
            period: '/month',
        },
        { 
            id: 'annual', 
            name: 'Annual',
            price: '$39.99',
            period: '/year',
            savings: 'Save 33%',
            isPopular: true 
        },
    ];

    // Initialize IAP on component mount
    useEffect(() => {
        initializeIAP();
        return () => {
            // Cleanup on unmount
            iapService.disconnect();
        };
    }, []);

    const initializeIAP = async () => {
        try {
            setIsInitializing(true);
            const initialized = await iapService.initialize();
            
            if (!initialized) {
                Alert.alert(
                    'Initialization Error',
                    'Unable to initialize payment system. Please try again later.'
                );
            }
        } catch (error) {
            console.error('IAP initialization error:', error);
            Alert.alert(
                'Error',
                'Failed to initialize payment system'
            );
        } finally {
            setIsInitializing(false);
        }
    };

    const handleSubscribe = async () => {
        try {
            setIsPurchasing(true);
            
            // Show confirmation with platform-specific payment method
            const platform = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';
            
            Alert.alert(
                'Confirm Purchase',
                `You will be charged using ${platform}. Continue?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setIsPurchasing(false),
                    },
                    {
                        text: 'Continue',
                        onPress: async () => {
                            await processPurchase();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error in handleSubscribe:', error);
            setIsPurchasing(false);
        }
    };

    const processPurchase = async () => {
        try {
            console.log(`Processing purchase for plan: ${selectedPlan}`);
            
            // Map our plan types to the IAP service plan types
            const iapPlanType = selectedPlan === 'monthly' ? 'basic' : 'unlimited';
            const result = await iapService.purchasePlan(iapPlanType as any);
            
            if (result.success) {
                // Purchase successful
                Alert.alert(
                    'Success!',
                    'Your subscription has been activated.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                navigation.navigate(SCREENS.HOME);
                            },
                        },
                    ]
                );
            } else {
                // Handle purchase errors
                handlePurchaseError(result.error);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            Alert.alert(
                'Purchase Failed',
                'An unexpected error occurred. Please try again.'
            );
        } finally {
            setIsPurchasing(false);
        }
    };

    const handlePurchaseError = (error?: string) => {
        if (error === PurchaseError.USER_CANCELLED) {
            // User cancelled, no need to show error
            return;
        }

        let message = 'An error occurred during purchase';
        
        switch (error) {
            case PurchaseError.PAYMENT_INVALID:
                message = 'Payment method is invalid';
                break;
            case PurchaseError.NETWORK_ERROR:
                message = 'Network error. Please check your connection';
                break;
            case PurchaseError.ALREADY_OWNED:
                message = 'You already own this subscription';
                break;
            case PurchaseError.NOT_AVAILABLE:
                message = 'This subscription is not available';
                break;
            default:
                message = 'Purchase failed. Please try again';
        }

        Alert.alert('Purchase Error', message);
    };

    const renderPlanOption = (plan: Plan) => {
        const isSelected = selectedPlan === plan.id;

        return (
            <TouchableOpacity
                key={plan.id}
                style={[
                    styles.planOption,
                    isSelected && styles.planOptionSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.7}
            >
                <View style={styles.planOptionLeft}>
                    <View style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected,
                    ]}>
                        {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        {plan.savings && (
                            <Text style={styles.savingsText}>{plan.savings}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.planPriceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                {plan.isPopular && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Show loading state during initialization
    if (isInitializing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingScreen}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingScreenText}>Initializing payment system...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const features = [
        { icon: '✓', text: 'Unlimited mail scans' },
        { icon: '✓', text: 'AI-powered summaries' },
        { icon: '✓', text: 'Archive & search all mail' },
        { icon: '✓', text: 'Priority support' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Upgrade to Pro</Text>
                </View>

                <View style={styles.container}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>📊</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>MailRecap Pro</Text>
                    <Text style={styles.subtitle}>Unlimited scans • Organized archive</Text>

                    {/* Plans */}
                    <View style={styles.plansContainer}>
                        {plans.map(renderPlanOption)}
                    </View>

                    {/* Features Grid */}
                    <View style={styles.featuresContainer}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Security Message */}
                    <View style={styles.securityContainer}>
                        <Text style={styles.securityIcon}>🔒</Text>
                        <Text style={styles.securityText}>Data secure • Never sold</Text>
                    </View>

                    {/* Subscribe Button */}
                    <TouchableOpacity
                        style={[
                            styles.subscribeButton,
                            isPurchasing && styles.subscribeButtonDisabled
                        ]}
                        onPress={handleSubscribe}
                        disabled={isPurchasing}
                        activeOpacity={0.8}
                    >
                        {isPurchasing ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.subscribeButtonText}>
                                Subscribe {selectedPlan === 'monthly' ? '$4.99/mo' : '$39.99/yr'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer Links */}
                    <View style={styles.footerLinks}>
                        <TouchableOpacity>
                            <Text style={styles.footerLinkText}>Privacy</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerLinkSeparator}>•</Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLinkText}>Terms</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cancellation Info */}
                    <Text style={styles.cancellationText}>
                        Cancel anytime • No hidden fees
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: hp(3),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        marginRight: wp(3),
    },
    backButtonText: {
        fontSize: wp(4),
        color: '#1f2937',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#1f2937',
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(3),
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: hp(2),
    },
    iconCircle: {
        width: wp(18),
        height: wp(18),
        borderRadius: wp(9),
        backgroundColor: '#dbeafe',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: wp(10),
    },
    title: {
        fontSize: wp(6.5),
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: wp(3.8),
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: hp(3),
    },
    plansContainer: {
        marginBottom: hp(3),
    },
    planOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
        position: 'relative',
    },
    planOptionSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff',
    },
    planOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioButton: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    radioButtonSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
    },
    radioButtonInner: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
        backgroundColor: '#ffffff',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: hp(0.3),
    },
    savingsText: {
        fontSize: wp(3.2),
        color: '#2563eb',
        fontWeight: '600',
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: wp(6),
        fontWeight: '700',
        color: '#1f2937',
    },
    planPeriod: {
        fontSize: wp(3.2),
        color: '#6b7280',
    },
    popularBadge: {
        position: 'absolute',
        top: -hp(1),
        right: wp(4),
        backgroundColor: '#2563eb',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
    },
    popularBadgeText: {
        fontSize: wp(3),
        color: '#ffffff',
        fontWeight: '600',
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(3),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: hp(1.5),
    },
    featureIcon: {
        fontSize: wp(4),
        color: '#2563eb',
        marginRight: wp(2),
    },
    featureText: {
        fontSize: wp(3.5),
        color: '#4b5563',
        flex: 1,
    },
    securityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
    },
    securityIcon: {
        fontSize: wp(4),
        marginRight: wp(2),
    },
    securityText: {
        fontSize: wp(3.5),
        color: '#6b7280',
    },
    subscribeButton: {
        backgroundColor: '#2563eb',
        borderRadius: wp(6),
        paddingVertical: hp(2),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
    },
    subscribeButtonDisabled: {
        opacity: 0.6,
    },
    subscribeButtonText: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#ffffff',
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1),
    },
    footerLinkText: {
        fontSize: wp(3.8),
        color: '#778299',
        fontWeight: '700',
    },
    footerLinkSeparator: {
        fontSize: wp(3.8),
        color: '#9ca3af',
        marginHorizontal: wp(2),
    },
    cancellationText: {
        fontSize: wp(3.2),
        color: '#778299',
        textAlign: 'center',
    },
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingScreenText: {
        fontSize: wp(4),
        color: '#4b5563',
        fontWeight: '500',
        marginTop: hp(2),
    },
});