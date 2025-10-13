import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../constants/StyleGuide';
import { CustomButton } from '../components/ui/CustomButton';
import { PlanCard, PlanType } from '../components/PlanCard';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';

interface Plan {
    id: PlanType;
    isPopular?: boolean;
}

export const SubscriptionPlanScreen: React.FC = () => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

    const navigation: any = useNavigation();

    const plans: Plan[] = [
        { id: 'basic' },
        { id: 'unlimited', isPopular: true },
    ];

    const handlePlanSelect = (plan: PlanType) => {
        setSelectedPlan(plan);
    };

    const handleContinue = () => {
        if (selectedPlan) {
            navigation.navigate(SCREENS.CAMERA_PERMISSION);
            console.log('Selected plan:', selectedPlan);
        }
    };

    const renderPlan = (plan: Plan) => {
        const planKey = plan.id;
        const isSelected = selectedPlan === planKey;

        const features = [
            t(`subscriptionPlan.${planKey}.feature1`),
            t(`subscriptionPlan.${planKey}.feature2`),
            t(`subscriptionPlan.${planKey}.feature3`),
            t(`subscriptionPlan.${planKey}.feature4`),
        ];

        return (
            <PlanCard
                key={planKey}
                planId={planKey}
                planName={t(`subscriptionPlan.${planKey}.name`)}
                price={t(`subscriptionPlan.${planKey}.price`)}
                period={t(`subscriptionPlan.${planKey}.period`)}
                features={features}
                isSelected={isSelected}
                isPopular={plan.isPopular}
                popularText={plan.isPopular ? t(`subscriptionPlan.${planKey}.popular`) : undefined}
                onSelect={handlePlanSelect}
            />
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('subscriptionPlan.title')}</Text>
                            <Text style={styles.subtitle}>{t('subscriptionPlan.subtitle')}</Text>
                        </View>

                        {/* Plans */}
                        <View style={styles.plansContainer}>
                            {plans.map(renderPlan)}
                        </View>

                        {/* Continue Button */}
                        <View style={styles.footer}>
                            <CustomButton
                                title={t('subscriptionPlan.continue')}
                                onPress={handleContinue}
                                disabled={!selectedPlan}
                                style={styles.continueButton}
                            />

                            {!selectedPlan && (
                                <Text style={styles.selectPlanText}>
                                    {t('subscriptionPlan.selectPlan')}
                                </Text>
                            )}

                            {/* Legal Footnote */}
                            <View style={styles.legalFootnote}>
                                <Text style={styles.legalFootnoteText}>
                                    {t('subscriptionPlan.legalFootnote')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
    },
    container: {
        flex: 1,
        maxWidth: wp(90),
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: hp(3),
        paddingTop: hp(1),
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(1),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(4),
        color: '#4b5563',
        textAlign: 'center',
    },
    plansContainer: {
        marginBottom: hp(.5),
    },
    footer: {
        paddingBottom: hp(3),
    },
    continueButton: {
        borderRadius: wp(5),
        paddingVertical: hp(1.3),
    },
    selectPlanText: {
        textAlign: 'center',
        color: '#4b5563',
        marginTop: hp(1),
        fontSize: wp(3.5),
    },
    legalFootnote: {
        marginTop: hp(2),
        padding: wp(3),
        backgroundColor: '#f9fafb',
        borderRadius: wp(4),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    legalFootnoteText: {
        fontSize: wp(2.8),
        color: '#4b5563',
        lineHeight: wp(4.5),
        textAlign: 'left',
    },
});