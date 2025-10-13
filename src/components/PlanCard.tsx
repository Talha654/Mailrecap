import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../constants/StyleGuide';

export type PlanType = 'basic' | 'unlimited';

interface PlanCardProps {
    planId: PlanType;
    planName: string;
    price: string;
    period: string;
    features: string[];
    isSelected: boolean;
    isPopular?: boolean;
    popularText?: string;
    onSelect: (planId: PlanType) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    planId,
    planName,
    price,
    period,
    features,
    isSelected,
    isPopular,
    popularText,
    onSelect,
}) => {
    const isPriceUnlimited = planId === 'unlimited';

    const renderFeature = (feature: string, index: number) => (
        <View key={index} style={styles.featureItem}>
            <View style={styles.featureCheckmark}>
                <Text style={styles.featureCheckmarkText}>✓</Text>
            </View>
            <Text style={styles.featureText}>{feature}</Text>
        </View>
    );

    return (
        <TouchableOpacity
            style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                isPopular && styles.unlimitedPlanCard,
            ]}
            onPress={() => onSelect(planId)}
            activeOpacity={0.85}
        >
            {/* Most Popular Badge */}
            {isPopular && popularText && (
                <View style={styles.popularBadgeContainer}>
                    <LinearGradient
                        colors={['#AD47FF', '#8B2BFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.popularBadge}
                    >
                        <Text style={styles.popularBadgeText}>
                            {popularText}
                        </Text>
                    </LinearGradient>
                </View>
            )}

            <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                    <Text style={styles.planName}>
                        {planName}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text
                            style={[
                                styles.planPrice,
                                isPriceUnlimited && styles.planPriceUnlimited,
                            ]}
                        >
                            {price}
                        </Text>
                        <Text style={styles.planPeriod}>
                            {period}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected,
                    ]}
                >
                    {isSelected && (
                        <Text style={styles.radioButtonCheckmark}>✓</Text>
                    )}
                </View>
            </View>

            <View style={styles.featuresContainer}>
                {features.map(renderFeature)}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    planCard: {
        backgroundColor: '#fff',
        borderRadius: wp(5),
        padding: wp(4),
        marginBottom: hp(2),
        borderWidth: 3,
        borderColor: 'transparent',
    },
    planCardSelected: {
        borderColor: '#AD47FF',
        shadowOpacity: 0.25,
        shadowRadius: wp(4),
        elevation: 8,
    },
    unlimitedPlanCard: {
        paddingTop: wp(6),
    },
    popularBadgeContainer: {
        position: 'absolute',
        top: -hp(1.2),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
    popularBadge: {
        borderRadius: wp(3),
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popularBadgeText: {
        color: '#ffffff',
        fontSize: wp(2.5),
        fontWeight: 'bold',
        padding: wp(1.5),
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: hp(0.5),
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: '#1f2937',
    },
    planPriceUnlimited: {
        color: '#990FFA',
    },
    planPeriod: {
        fontSize: wp(3.5),
        color: '#4b5563',
        marginLeft: wp(1),
    },
    radioButton: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        backgroundColor: '#AD47FF',
        borderColor: '#AD47FF',
    },
    radioButtonCheckmark: {
        color: '#ffffff',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    featuresContainer: {
        gap: hp(1),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureCheckmark: {
        width: wp(4),
        height: wp(4),
        borderRadius: wp(2),
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(2),
        marginTop: hp(0.2),
    },
    featureCheckmarkText: {
        color: '#ffffff',
        fontSize: wp(2.5),
        fontWeight: 'bold',
    },
    featureText: {
        flex: 1,
        fontSize: wp(3.5),
        color: '#374151',
        lineHeight: wp(5),
    },
});
