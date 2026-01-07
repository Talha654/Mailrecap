import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../constants/StyleGuide';
import { revenueCatService } from '../services/revenueCat.service';
import { PurchasesPackage } from 'react-native-purchases';
import { PurchaseError } from '../types/subscription';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';
import { fonts } from '../constants/fonts';
import { Shield, Sparkles } from 'lucide-react-native';
import { icons } from '../constants/images';

type PlanId = 'essentials_monthly' | 'essentials_yearly' | 'plus_monthly' | 'plus_yearly';

interface PricingOption {
    id: PlanId;
    price: string;
    period?: string;
    savings?: string;
    description?: string;
}

interface Tier {
    id: string;
    title: string;
    description?: string;
    badge?: string;
    options: PricingOption[];
    features: string[];
}

export const SubscriptionPlanScreen: React.FC = () => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<PlanId>('essentials_yearly');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [availablePackages, setAvailablePackages] = useState<PurchasesPackage[]>([]);

    const navigation: any = useNavigation();

    const tiers: Tier[] = [
        {
            id: 'essentials',
            title: 'MailRecap Essentials',
            description: 'Perfect for individuals and households who just want peace of mind with their important mail.',
            options: [
                {
                    id: 'essentials_monthly',
                    price: '$3.99 / month'
                },
                {
                    id: 'essentials_yearly',
                    price: '$39 / year',
                    savings: 'Save over 15%'
                }
            ],
            features: [
                'Up to 10 letters per month',
                'Mail summaries shown in large, easy-to-read text',
                'Suggestions for next steps (pay, call, save, calendar, etc.)',
                'Archive of all scanned mail so you can find things later'
            ]
        },
        {
            id: 'plus',
            title: 'MailRecap+',
            badge: 'Popular',
            description: 'Best for busy households, caregivers, and anyone who handles a lot of mail each month.',
            options: [
                {
                    id: 'plus_monthly',
                    price: '$14.99 / month'
                },
                {
                    id: 'plus_yearly',
                    price: '$149 / year',
                    savings: 'Save over 15%'
                }
            ],
            features: [
                'Unlimited letters per month',
                'Mail summaries in large text + spoken read-out',
                'Suggestions for next steps on every letter',
                'Archive of all scanned mail with full history'
            ]
        }
    ];

    // Initialize RevenueCat on component mount
    useEffect(() => {
        initializeRevenueCat();
    }, []);

    const initializeRevenueCat = async () => {
        try {
            setIsInitializing(true);
            const initialized = await revenueCatService.initialize();

            if (initialized) {
                const packages = await revenueCatService.loadOfferings();
                setAvailablePackages(packages);

                // Show warning if no packages are available
                if (!packages || packages.length === 0) {
                    Alert.alert(
                        'Configuration Issue',
                        'Subscription products are not available at the moment. This may be due to:\n\n' +
                        '• Products not configured in App Store Connect / Play Console\n' +
                        '• RevenueCat dashboard configuration incomplete\n' +
                        '• Sync delay (wait 10-15 minutes)\n\n' +
                        'Please check your configuration and try again later.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                Alert.alert(
                    t('subscriptionPlan.initializationError'),
                    'Failed to initialize subscription service. Please check your internet connection and try again.'
                );
            }
        } catch (error: any) {
            console.error('RevenueCat initialization error:', error);
            Alert.alert(
                t('common.error'),
                error?.message || t('subscriptionPlan.failedInit')
            );
        } finally {
            setIsInitializing(false);
        }
    };

    const handleSubscribe = async () => {
        try {
            setIsPurchasing(true);

            // Show confirmation with platform-specific payment method
            const platform = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

            Alert.alert(
                t('subscriptionPlan.confirmPurchase'),
                t('subscriptionPlan.confirmPurchaseDesc', { platform: platform }),
                [
                    {
                        text: t('common.cancel'),
                        style: 'cancel',
                        onPress: () => setIsPurchasing(false),
                    },
                    {
                        text: t('common.continue'),
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

            if (!availablePackages || availablePackages.length === 0) {
                Alert.alert(t('common.error'), 'Offerings not loaded. Please try again.');
                return;
            }

            // Find the package that matches our selectedPlan
            // RevenueCat product IDs may be in format: "essentials_monthly:essentials-monthly"
            // We need to match against the part before the colon
            let packageToPurchase: PurchasesPackage | undefined;

            packageToPurchase = availablePackages.find(pkg => {
                const productId = pkg.product.identifier;
                const packageId = pkg.identifier;

                // Extract the base product ID (part before colon if it exists)
                const baseProductId = productId.includes(':')
                    ? productId.split(':')[0]
                    : productId;

                return (
                    packageId === selectedPlan ||           // Direct package match
                    productId === selectedPlan ||           // Full product ID match
                    baseProductId === selectedPlan ||       // Base product ID match (before colon)
                    productId.includes(selectedPlan) ||     // Product ID contains match
                    baseProductId.includes(selectedPlan)    // Base product ID contains match
                );
            });

            if (!packageToPurchase) {
                console.error('[SubscriptionPlan] ❌ No matching package found!');
                console.error('[SubscriptionPlan] Looking for:', selectedPlan);
                console.error('[SubscriptionPlan] Available products:');
                availablePackages.forEach((p, idx) => {
                    console.error(`  ${idx + 1}. Package ID: "${p.identifier}" | Product ID: "${p.product.identifier}"`);
                });

                // Show user-friendly error with available options
                const availableIds = availablePackages.map(p => `"${p.product.identifier}"`).join(', ');
                Alert.alert(
                    'Product Configuration Error',
                    `The selected plan "${selectedPlan}" doesn't match any configured products.\n\nAvailable products:\n${availableIds}\n\nPlease check your RevenueCat dashboard or contact support.`,
                    [{ text: 'OK' }]
                );
                return;
            }

            console.log('[SubscriptionPlan] ✅ Found matching package!');
            console.log('[SubscriptionPlan] ========================================');
            console.log('[SubscriptionPlan] PURCHASE DETAILS:');
            console.log('[SubscriptionPlan] Selected Plan ID:', selectedPlan);
            console.log('[SubscriptionPlan] Package Identifier:', packageToPurchase.identifier);
            console.log('[SubscriptionPlan] Product ID:', packageToPurchase.product.identifier);
            console.log('[SubscriptionPlan] Product Title:', packageToPurchase.product.title);
            console.log('[SubscriptionPlan] Price:', packageToPurchase.product.priceString);
            console.log('[SubscriptionPlan] Product Type:', packageToPurchase.product.productType);
            console.log('[SubscriptionPlan] ========================================');
            console.log('[SubscriptionPlan] Attempting purchase...');

            const result = await revenueCatService.purchasePlan(packageToPurchase, selectedPlan);

            if (result.success) {
                // Purchase successful
                Alert.alert(
                    t('common.success'),
                    t('subscriptionPlan.subscriptionActivated'),
                    [
                        {
                            text: t('common.continue'),
                            onPress: () => {
                                navigation.navigate(SCREENS.HOME);
                            },
                        },
                    ]
                );
            } else {
                // Handle specific purchase errors (like ALREADY_OWNED)
                handlePurchaseError(result.error?.code);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            Alert.alert(
                t('subscriptionPlan.purchaseFailed'),
                t('subscriptionPlan.purchaseError')
            );
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestorePurchases = async () => {
        try {
            setIsPurchasing(true);
            const customerInfo = await revenueCatService.restorePurchases();

            if (customerInfo) {
                // Check if they actually have an active entitlement now
                const activeEntitlements = Object.keys(customerInfo.entitlements.active);
                if (activeEntitlements.length > 0) {
                    Alert.alert(
                        t('common.success'),
                        'Purchases restored successfully!',
                        [
                            {
                                text: t('common.continue'),
                                onPress: () => navigation.navigate(SCREENS.HOME),
                            },
                        ]
                    );
                } else {
                    Alert.alert(
                        'No Active Subscriptions',
                        'We found your purchase history, but no active subscriptions were found to restore.'
                    );
                }
            } else {
                Alert.alert(t('common.error'), 'Failed to restore purchases. Please try again.');
            }
        } catch (error) {
            console.error('Restore error:', error);
            Alert.alert(t('common.error'), 'An error occurred while restoring purchases.');
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

        if (error === PurchaseError.ALREADY_OWNED) {
            Alert.alert(
                'Already Subscribed',
                'It looks like you already have an active subscription with this App Store / Play Store account.\n\nWould you like to restore your purchase?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Restore Purchase', onPress: handleRestorePurchases }
                ]
            );
            return;
        }

        switch (error) {
            case PurchaseError.PAYMENT_INVALID:
                message = t('subscriptionPlan.paymentInvalid');
                break;
            case PurchaseError.NETWORK_ERROR:
                message = t('subscriptionPlan.networkError');
                break;
            case PurchaseError.NOT_AVAILABLE:
                message = t('subscriptionPlan.notAvailable');
                break;
            default:
                message = t('subscriptionPlan.purchaseError');
        }

        Alert.alert(t('subscriptionPlan.purchaseErrorTitle'), message);
    };

    const renderTier = (tier: Tier) => {
        return (
            <View key={tier.id} style={styles.tierCard}>
                {tier.badge && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>{tier.badge}</Text>
                    </View>
                )}

                <View style={styles.tierHeader}>
                    <Sparkles size={20} color="#D6212F" style={styles.tierIcon} />
                    <Text style={styles.tierTitle}>{tier.title}</Text>
                </View>

                {tier.description && (
                    <Text style={styles.tierDescription}>{tier.description}</Text>
                )}

                <View style={styles.optionsContainer}>
                    {tier.options.map((option) => {
                        const isSelected = selectedPlan === option.id;

                        // Find dynamic price from RevenueCat packages
                        let dynamicPrice = option.price;
                        if (availablePackages.length > 0) {
                            const pkg = availablePackages.find(p => {
                                const productId = p.product.identifier;
                                const baseProductId = productId.includes(':')
                                    ? productId.split(':')[0]
                                    : productId;

                                return (
                                    p.identifier === option.id ||
                                    productId === option.id ||
                                    baseProductId === option.id ||
                                    productId.includes(option.id) ||
                                    baseProductId.includes(option.id)
                                );
                            });
                            if (pkg) {
                                dynamicPrice = pkg.product.priceString;
                                // If it's a monthly or yearly, we can append the period
                                if (option.id.includes('monthly')) dynamicPrice += ' / month';
                                else if (option.id.includes('yearly')) dynamicPrice += ' / year';
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.optionButtonSelected
                                ]}
                                onPress={() => setSelectedPlan(option.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.radioButton,
                                    isSelected && styles.radioButtonSelected
                                ]}>
                                    {isSelected && <View style={styles.radioButtonInner} />}
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionPrice}>{dynamicPrice}</Text>
                                    {option.description && (
                                        <Text style={styles.optionDescription}>{option.description}</Text>
                                    )}
                                    {option.savings && (
                                        <Text style={styles.savingsText}>{option.savings}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.featuresList}>
                    {tier.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Text style={styles.featureCheck}>✓</Text>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    // Show loading state during initialization
    if (isInitializing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingScreen}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingScreenText}>{t('subscriptionPlan.loadingInit')}</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                        <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('subscriptionPlan.title')}</Text>
                </View>

                <View style={styles.container}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Image source={icons.mail} style={styles.icon} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{t('home.title')}</Text>
                    <Text style={styles.subtitle}>{t('subscriptionPlan.mailMadeSimple')}</Text>
                    {/* Tiers */}
                    <View style={styles.tiersContainer}>
                        {tiers.map(renderTier)}
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
                                {t('subscriptionPlan.subscribe')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer Links */}
                    <View style={styles.footerLinks}>
                        <TouchableOpacity>
                            <Text style={styles.footerLinkText}>{t('mailSummary.privacy')}</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerLinkSeparator}>•</Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLinkText}>{t('mailSummary.terms')}</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerLinkSeparator}>•</Text>
                        <TouchableOpacity onPress={handleRestorePurchases}>
                            <Text style={styles.footerLinkText}>Restore Purchases</Text>
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
        backgroundColor: '#E9EFF5',
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
        backgroundColor: '#E9EFF5',
    },
    backButton: {
        marginRight: wp(3),
    },
    backButtonText: {
        fontSize: wp(4),
        color: '#000F54',
        fontFamily: fonts.inter.medium,
    },
    headerTitle: {
        fontSize: wp(4.5),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(1),
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: hp(2),
    },
    iconCircle: {
        width: wp(18),
        height: wp(18),
        borderRadius: wp(9),
        backgroundColor: '#D6212F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: wp(9),
        height: wp(9),
        tintColor: '#fff',
    },
    title: {
        fontSize: wp(6.5),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        textAlign: 'center',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: wp(4),
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: hp(3),
    },
    tiersContainer: {
        gap: hp(2),
        marginBottom: hp(3),
    },
    tierCard: {
        backgroundColor: '#ffffff',
        borderRadius: wp(6),
        padding: wp(5),
        borderWidth: 1,
        borderColor: '#ffcccc', // Light red border for paid tiers
        position: 'relative',
    },

    popularBadge: {
        position: 'absolute',
        top: -hp(1.5),
        right: wp(5),
        backgroundColor: '#D6212F',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(4),
        zIndex: 10,
    },
    popularBadgeText: {
        color: '#ffffff',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    tierIcon: {
        marginRight: wp(2),
    },
    tierTitle: {
        fontSize: wp(5),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
    },
    tierDescription: {
        fontSize: wp(3.8),
        color: '#6b7280',
        marginBottom: hp(2),
        lineHeight: wp(5),
    },
    optionsContainer: {
        gap: hp(1.5),
        marginBottom: hp(2),
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: wp(8),
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    optionButtonSelected: {
        borderColor: '#D6212F',
        backgroundColor: '#FFF5F5',
        borderWidth: 1.5,
    },
    radioButton: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    radioButtonSelected: {
        borderColor: '#D6212F',
        backgroundColor: '#D6212F',
        borderWidth: 0,
    },
    radioButtonInner: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
        backgroundColor: '#ffffff',
    },
    optionInfo: {
        flex: 1,
    },
    optionPrice: {
        fontSize: wp(4),
        fontFamily: fonts.inter.bold,
        color: '#000F54',
    },
    optionDescription: {
        fontSize: wp(3.5),
        color: '#6b7280',
        marginTop: hp(0.5),
    },
    savingsText: {
        fontSize: wp(3.5),
        color: '#D6212F',
        fontWeight: '600',
        marginTop: hp(0.5),
    },
    featuresList: {
        gap: hp(1),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureCheck: {
        color: '#D6212F',
        fontSize: wp(4),
        marginRight: wp(2),
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: wp(3.8),
        color: '#6b7280',
        flex: 1,
        lineHeight: wp(5),
    },
    subscribeButton: {
        backgroundColor: '#000F54',
        borderRadius: wp(8),
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
        fontSize: wp(3.5),
        color: '#6b7280',
    },
    footerLinkSeparator: {
        fontSize: wp(3.5),
        color: '#9ca3af',
        marginHorizontal: wp(2),
    },
    cancellationText: {
        fontSize: wp(3.2),
        color: '#9ca3af',
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