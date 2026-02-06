import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    LayoutAnimation,
    // UIManager, // Removed as we use Reanimated
    // Animated, // Removed as we use Reanimated
    // Easing,
    Platform,
    FlatList,
} from 'react-native';
import Animated, {
    FadeInLeft,
    FadeOut,
    Layout,
    ZoomIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    interpolateColor,
    useDerivedValue,
    withTiming
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

// if (
//     Platform.OS === 'android' &&
//     UIManager.setLayoutAnimationEnabledExperimental
// ) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }
import { useTranslation } from 'react-i18next';
import { wp, hp } from '../constants/StyleGuide';

import { MailItem } from '../types/mail';
import { MailCard } from '../components';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserMailSummaries, updateMailSummary } from '../services/mailSummary.service';
import {
    ArrowLeft,
    Mail,
    Check,
} from 'lucide-react-native';

const CATEGORIES = [
    { id: 'All', label: 'All', icon: undefined },
    { id: 'Completed', label: 'Completed', icon: Check },
];

const CategoryItem = ({ id, label, isSelected, onPress }: { id: string, label: string, isSelected: boolean, onPress: (id: string) => void }) => {
    const progress = useDerivedValue(() => {
        return withTiming(isSelected ? 1 : 0, { duration: 250 });
    });

    const scale = useDerivedValue(() => {
        return withSpring(isSelected ? 1.05 : 1, { damping: 15, stiffness: 150 });
    });

    const rContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(0,0,0,0)', '#D6212F']
        );
        return {
            backgroundColor,
            transform: [{ scale: scale.value }]
        };
    });

    const rTextStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            progress.value,
            [0, 1],
            ['#4B5563', '#FFFFFF']
        );
        return { color, fontWeight: isSelected ? '600' : '500' }; // slight weight boost
    });

    return (
        <Pressable onPress={() => onPress(id)}>
            <Animated.View
                layout={Layout.springify().damping(15)}
                style={[styles.categoryChip, rContainerStyle]}
            >
                <Animated.Text style={[styles.categoryText, rTextStyle]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

export const ArchiveScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    const [categories, setCategories] = useState(CATEGORIES);
    const [mailItems, setMailItems] = useState<MailItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation for the mail count
    const scale = useSharedValue(1);

    const animatedCountStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // Fetch mail summaries from Firestore
    const fetchMailSummaries = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const summaries = await getUserMailSummaries();

            // Convert to MailItem format
            // NOTE: In a real app, we would have category from backend.
            // For now, we will assign a random category for demo purposes if not present,
            // or just default to 'personal'.
            // WE DO NOT PERSIST THIS RANDOM CATEGORY, IT IS JUST FOR UI DEMO.
            const items: MailItem[] = summaries.map(summary => ({
                id: summary.id,
                userId: summary.userId,
                title: summary.title,
                summary: summary.summary,
                fullText: summary.fullText,
                suggestions: summary.suggestions,
                photoUrl: summary.photoUrl,
                date: summary.createdAt.toISOString().split('T')[0],
                createdAt: summary.createdAt,
                updatedAt: summary.updatedAt,
                actionableDate: summary.actionableDate,
                // Use category from backend or default to 'personal' if missing
                category: summary.category || 'personal',
                links: summary.links,
                isCompleted: summary.isCompleted || false,
            }));

            // Sort by confidence: HIGH > MEDIUM > LOW > Others
            items.sort((a, b) => {
                const getScore = (confidence?: string) => {
                    const c = confidence?.toUpperCase();
                    if (c === 'HIGH') return 3;
                    if (c === 'MEDIUM') return 2;
                    if (c === 'LOW') return 1;
                    return 0;
                };

                const scoreA = getScore(a.actionableDate?.confidence);
                const scoreB = getScore(b.actionableDate?.confidence);

                // If confidence is the same, keep original sort order (which is by createdAt desc)
                if (scoreA === scoreB) {
                    return 0;
                }

                // Sort by score descending
                return scoreB - scoreA;
            });

            setMailItems(items);
        } catch (err) {
            console.error('[ArchiveScreen] Error fetching summaries:', err);
            setError('Failed to load summaries. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMailSummaries();
    }, []);

    // Dynamically update categories based on mailItems
    useEffect(() => {
        if (mailItems.length === 0) return;

        const newCategories = [...CATEGORIES];

        mailItems.forEach(item => {
            if (item.category) {
                // Check if category is already present (exact match or substring match)
                // e.g. If "Utilities" comes in, and we have "Bills & Utilities", don't add it.
                const exists = newCategories.some(cat =>
                    item.category && (
                        cat.id === item.category ||
                        cat.id.includes(item.category) ||
                        item.category.includes(cat.id)
                    )
                );

                if (!exists && item.category) {
                    console.log('Adding new category:', item.category);
                    newCategories.push({
                        id: item.category,
                        label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
                        icon: undefined // No icon for dynamic categories for now
                    });
                }
            }
        });

        // Only update if we actually added something to avoid infinite loops if we were careless
        // (though simple length check is efficient enough here)
        if (newCategories.length > categories.length) {
            setCategories(newCategories);
        }
    }, [mailItems]);

    const handleToggleComplete = async (id: string) => {
        // Optimistic update
        const itemToUpdate = mailItems.find(item => item.id === id);
        if (!itemToUpdate) return;

        const newIsCompleted = !itemToUpdate.isCompleted;

        setMailItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                return { ...item, isCompleted: newIsCompleted };
            }
            return item;
        }));

        try {
            await updateMailSummary(id, { isCompleted: newIsCompleted });
            console.log(`[ArchiveScreen] Updated mail ${id} completion status to ${newIsCompleted}`);
        } catch (err) {
            console.error('[ArchiveScreen] Error updating mail completion status:', err);
            // Revert changes on error
            setMailItems(prevItems => prevItems.map(item => {
                if (item.id === id) {
                    return { ...item, isCompleted: !newIsCompleted };
                }
                return item;
            }));
        }
    };

    const filteredItems = React.useMemo(() => {
        let filtered = mailItems;

        if (selectedCategory === 'Completed') {
            // Show ONLY completed items
            filtered = mailItems.filter(item => item.isCompleted);
        } else {
            // For other categories, show ONLY active (uncompleted) items
            filtered = mailItems.filter(item => !item.isCompleted);

            if (selectedCategory !== 'All') {
                filtered = filtered.filter(item => {
                    // Strictly match category
                    return item.category === selectedCategory;
                });
            }
        }
        return filtered;
    }, [selectedCategory, mailItems]);

    const handleCategorySelect = (categoryId: string) => {
        // LayoutAnimation.configureNext(CustomLayoutAnimation); // Removed
        setSelectedCategory(categoryId);
    };

    // Animate the count whenever it changes
    useEffect(() => {
        scale.value = withSequence(
            withSpring(1.2, { damping: 12, stiffness: 120 }),
            withSpring(1, { damping: 12, stiffness: 120 })
        );
    }, [filteredItems.length]);

    const handleRefresh = () => {
        fetchMailSummaries(true);
    };



    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Mail color={'#fff'} size={wp(10)} />
            </View>
            <Text style={styles.emptyTitle}>
                {error ? t('archive.errorLoading') : t('archive.empty')}
            </Text>
            <Text style={styles.emptyDescription}>
                {error ? t('archive.errorLoadingMessage') : t('archive.emptyDesc')}
            </Text>
            {error && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchMailSummaries()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.retryButtonText}>{t('archive.retry')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderMailItem = ({ item, index }: { item: MailItem, index: number }) => {
        return (
            <Animated.View
                layout={Layout.duration(300)}
                entering={FadeInLeft.delay(index * 200).duration(300)}
                exiting={FadeOut.duration(200)}
            >
                <MailCard
                    key={item.id}
                    item={item}
                    onPress={(mailItem) => navigation.navigate(SCREENS.MAIL_SUMMARY, { mailItem })}
                    onToggleComplete={handleToggleComplete}
                />
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Animated.Text style={[styles.headerCount, animatedCountStyle]}>
                        {selectedCategory === 'All'
                            ? mailItems.filter(item => !item.isCompleted).length // Total active count for All
                            : filteredItems.length}
                    </Animated.Text>
                    <Text style={styles.headerLabel}>TOTAL INBOX</Text>
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {categories.map(cat => (
                        <CategoryItem
                            key={cat.id}
                            id={cat.id}
                            label={cat.label}
                            isSelected={selectedCategory === cat.id}
                            onPress={handleCategorySelect}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D6212F" />
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderMailItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#D6212F"
                            colors={['#D6212F']}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    header: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(1),
        backgroundColor: '#F3F4F6',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    headerCount: {
        fontSize: wp(10),
        fontWeight: '700',
        color: '#D6212F', // Red color matches design
        marginRight: wp(2),
    },
    headerLabel: {
        fontSize: wp(3.5),
        fontWeight: '600',
        color: '#9CA3AF', // Gray text
        letterSpacing: 1,
    },
    categoriesContainer: {
        marginBottom: hp(2),
    },
    categoriesContent: {
        paddingHorizontal: wp(5),
        gap: wp(2),
    },
    categoryChip: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: wp(5),
        backgroundColor: 'transparent',
    },
    categoryChipSelected: {
        backgroundColor: '#D6212F',
    },
    categoryText: {
        fontSize: wp(3.8),
        color: '#4B5563',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    scrollViewContent: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(3),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(10),
    },
    emptyIconContainer: {
        width: wp(16),
        height: wp(16),
        backgroundColor: '#E5E7EB',
        borderRadius: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
    },
    emptyTitle: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#374151',
        marginBottom: hp(1),
    },
    emptyDescription: {
        fontSize: wp(3.5),
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: wp(10),
    },
    retryButton: {
        marginTop: hp(2),
        backgroundColor: '#D6212F',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.2),
        borderRadius: wp(6),
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});