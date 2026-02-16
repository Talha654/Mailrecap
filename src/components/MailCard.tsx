import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { SharedTransition, withSpring } from 'react-native-reanimated';
import { MailItem } from '../types/mail';
import { wp, hp } from '../constants/StyleGuide';
import { Check } from 'lucide-react-native';
import { getCategoryIcon } from '../constants/CategoryIcons';

interface MailCardProps {
    item: MailItem;
    onPress: (item: MailItem) => void;
    onToggleComplete: (id: string, success?: boolean) => void;
}

// Custom transition removed due to runtime error with v4
// const customTransition = SharedTransition.custom(...)

export const MailCard: React.FC<MailCardProps> = ({ item, onPress, onToggleComplete }) => {
    const isPriority = item.actionableDate?.confidence === 'HIGH';
    const hasAction = item.suggestions && item.suggestions.length > 0;
    const dueDate = item.actionableDate?.date;
    const Icon = getCategoryIcon(item.category);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
    };

    const formatDueDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Animated.View
            style={styles.cardContainer}
            sharedTransitionTag={`mailCard-${item.id}`}
        >
            <TouchableOpacity
                style={styles.innerContainer}
                onPress={() => onPress(item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeaderRow}>
                    <View style={styles.leftColumn}>
                        <View style={[
                            styles.iconWrapper,
                            item.category === 'Suspicious' && styles.iconWrapperSuspicious
                        ]}>
                            {/* Dynamic icon based on category */}
                            <Icon
                                color={item.category === 'Suspicious' ? '#DC2626' : "#1F2937"}
                                size={wp(6)}
                            />
                        </View>
                    </View>

                    <View style={styles.cardHeaderContent}>
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                        <View style={styles.badgesContainer}>
                            {isPriority && (
                                <View style={[styles.badge, styles.priorityBadge]}>
                                    <Text style={styles.priorityBadgeText}>PRIORITY</Text>
                                </View>
                            )}
                            <View style={[styles.badge, styles.packBadge]}>
                                <Text style={styles.packBadgeText}>PACK</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.checkContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkButton,
                            item.isCompleted && styles.checkButtonCompleted
                        ]}
                        onPress={() => onToggleComplete(item.id, !item.isCompleted)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Check color={item.isCompleted ? '#FFFFFF' : "#1F2937"} size={wp(4)} />
                    </TouchableOpacity>

                    <View style={styles.textContainer}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.itemSummary} numberOfLines={2}>
                            {item.summary}
                        </Text>
                    </View>
                </View>
                {(hasAction || dueDate) && (
                    <View style={styles.actionFooter}>
                        <View style={styles.actionRow}>
                            {hasAction && (
                                <View style={styles.actionLeft}>
                                    <Text style={styles.actionLabel}>ACTION:</Text>
                                    <Text style={styles.actionValue} numberOfLines={1}>
                                        Take action
                                    </Text>
                                </View>
                            )}
                            {dueDate && (
                                <View style={styles.actionRight}>
                                    <Text style={styles.dueLabel}>DUE:</Text>
                                    <Text style={styles.dueValue}>{formatDueDate(dueDate)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // elevation: 3, // Removed validation shadow on Android
        marginBottom: hp(2), // Add margin bottom for list spacing
    },
    innerContainer: {
        padding: wp(5),
    },
    cardHeaderRow: {
        flexDirection: 'row',
        marginBottom: hp(1.5),
    },
    iconWrapper: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(3),
        backgroundColor: '#EFF6FF', // Light blue bg for icon
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperSuspicious: {
        backgroundColor: '#FEE2E2', // Light red bg for suspicious
    },
    leftColumn: {
        alignItems: 'center',
        marginRight: wp(3),
        gap: hp(1.5),
    },
    checkButton: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(6),
        marginLeft: wp(2),
        borderWidth: 1.5,
        borderColor: '#1E3A8A', // Dark blue border
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkButtonCompleted: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    cardHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // backgroundColor: 'red'
    },
    dateText: {
        fontSize: wp(3),
        color: '#9CA3AF',
        fontWeight: '600',
        marginTop: wp(1),
        letterSpacing: 0.5,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: wp(1.5),
    },
    badge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(3),
    },
    priorityBadge: {
        backgroundColor: '#1E3A8A', // Dark blue
    },
    priorityBadgeText: {
        color: '#FFFFFF',
        fontSize: wp(2.5),
        fontWeight: '700',
    },
    packBadge: {
        backgroundColor: '#9333EA', // Purple
    },
    packBadgeText: {
        color: '#FFFFFF',
        fontSize: wp(2.5),
        fontWeight: '700',
    },
    checkContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: wp(3),
    },
    textContainer: {
        flex: 1,
        marginBottom: hp(2),
    },
    itemTitle: {
        fontSize: wp(5),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(0.5),
    },
    itemSummary: {
        fontSize: wp(3.2),
        color: '#6B7280',
        marginBottom: hp(2),
        lineHeight: wp(5.5),
    },
    actionFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: hp(1.5),
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionLeft: {
        flex: 1,
    },
    actionLabel: {
        fontSize: wp(2.5),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    actionValue: {
        fontSize: wp(3.5),
        fontWeight: '600',
        color: '#111827',
    },
    actionRight: {
        alignItems: 'flex-end',
    },
    dueLabel: {
        fontSize: wp(2.5),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    dueValue: {
        fontSize: wp(3.5),
        fontWeight: '700',
        color: '#D6212F', // Red for due date
    },
});
