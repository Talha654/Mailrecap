import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hp, wp } from '../constants/StyleGuide';
import { CustomButton } from '../components/ui/CustomButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { SCREENS } from '../navigation/screens';
import { saveMailSummary } from '../services/mailSummary.service';

export interface MailItem {
    id: string;
    userId?: string;
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    date: string;
    photoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const CameraScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCamera, setShowCamera] = useState(true);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset screen to step 1 when user navigates back
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                // This cleanup function runs when screen loses focus
                setCapturedPhoto(null);
                setCurrentStep(1);
                setIsProcessing(false);
                setProgress(0);
                setShowCamera(true);
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            };
        }, [])
    );
    const [_mailItems, setMailItems] = useState<MailItem[]>([
        {
            id: '1',
            title: 'Electric Bill - Due Soon',
            summary: 'Your electric bill is $127.45 and due on March 25th.',
            fullText: 'Dear Customer, Your electric bill for February is $127.45. Payment is due by March 25th, 2024. You can pay online, by phone, or by mail.',
            suggestions: ['Pay online at company website', 'Set up automatic payments', 'Call customer service: 1-800-555-0123'],
            date: '2024-03-15'
        },
        {
            id: '2',
            title: 'Doctor Appointment Reminder',
            summary: 'Appointment with Dr. Smith on March 20th at 2:00 PM.',
            fullText: 'This is a reminder of your upcoming appointment with Dr. Smith on March 20th, 2024 at 2:00 PM. Please arrive 15 minutes early.',
            suggestions: ['Add to calendar', 'Prepare list of questions', 'Bring insurance card and ID'],
            date: '2024-03-12'
        }
    ]);

    const handleTakePhoto = async () => {
        try {
            const image = await ImagePicker.openCamera({
                width: 1200,
                height: 1600,
                cropping: true,
                cropperCircleOverlay: false,
                compressImageQuality: 0.8,
                includeBase64: false,
                mediaType: 'photo',
            });

            if (image) {
                console.log('Image captured:', image.path);
                setCapturedPhoto(image.path);
                setCurrentStep(2);
            }
        } catch (error: unknown) {
            if (error instanceof Error && 'code' in error) {
                const errorWithCode = error as { code: string; message: string };
                if (errorWithCode.code === 'E_PICKER_CANCELLED') {
                    console.log('User cancelled camera');
                } else {
                    console.log('Camera Error:', errorWithCode.message);
                    Alert.alert('Error', 'Failed to open camera. Please try again.....');
                }
            } else {
                console.log('Camera Error:', error);
                Alert.alert('Error', 'Failed to open camera. Please try again.????');
            }
        }
    };

    const handleChoosePhoto = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 1200,
                height: 1600,
                cropping: true,
                cropperCircleOverlay: false,
                compressImageQuality: 0.8,
                includeBase64: false,
                mediaType: 'photo',
            });

            if (image) {
                console.log('Image selected:', image.path);
                processPhoto(image.path);
            }
        } catch (error: unknown) {
            if (error instanceof Error && 'code' in error) {
                const errorWithCode = error as { code: string; message: string };
                if (errorWithCode.code === 'E_PICKER_CANCELLED') {
                    console.log('User cancelled image picker');
                } else {
                    console.log('Image Picker Error:', errorWithCode.message);
                    Alert.alert('Error', 'Failed to select image. Please try again.');
                }
            } else {
                console.log('Image Picker Error:', error);
                Alert.alert('Error', 'Failed to select image. Please try again.');
            }
        }
    };

    const processPhoto = async (photoPath: string) => {
        setIsProcessing(true);
        setShowCamera(false);

        // Simulate processing with progress
        let currentProgress = 0;
        progressInterval.current = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
                setTimeout(async () => {
                    try {
                        // Simulate processing a new mail item
                        const mailSummaryData = {
                            title: 'New Mail Item',
                            summary: 'This letter is about a subscription renewal for your magazine. It costs $29.99 per year.',
                            fullText: 'Dear Subscriber, We hope you have enjoyed your magazine subscription. Your subscription will expire next month. To continue receiving your magazine, please renew for $29.99 per year.',
                            suggestions: ['Renew subscription online', 'Call customer service', 'Consider digital subscription instead'],
                            photoUrl: photoPath,
                        };

                        // Save to Firestore
                        const savedSummary = await saveMailSummary(mailSummaryData);
                        console.log('[CameraScreen] Summary saved to Firestore:', savedSummary.id);

                        // Convert to MailItem for navigation
                        const newMailItem: MailItem = {
                            id: savedSummary.id,
                            userId: savedSummary.userId,
                            title: savedSummary.title,
                            summary: savedSummary.summary,
                            fullText: savedSummary.fullText,
                            suggestions: savedSummary.suggestions,
                            photoUrl: savedSummary.photoUrl,
                            date: savedSummary.createdAt.toISOString().split('T')[0],
                            createdAt: savedSummary.createdAt,
                            updatedAt: savedSummary.updatedAt,
                        };

                        setMailItems(prev => [newMailItem, ...prev]);

                        setIsProcessing(false);
                        setProgress(0);
                        setShowCamera(true);

                        // Navigate to MailSummaryScreen with the new mail item
                        navigation.navigate(SCREENS.MAIL_SUMMARY, { mailItem: newMailItem });
                        setCurrentStep(1);
                    } catch (error) {
                        console.error('[CameraScreen] Error saving summary:', error);
                        setIsProcessing(false);
                        setProgress(0);
                        setShowCamera(true);
                        Alert.alert('Error', 'Failed to save scanned summary. Please try again.');
                    }
                }, 500);
            }
        }, 200);
    };

    const handleBack = () => {
        if (capturedPhoto) {
            setCapturedPhoto(null);
            setCurrentStep(1);
        } else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            navigation.goBack();
        }
    };

    const handleRetake = () => {
        setCapturedPhoto(null);
        setCurrentStep(1);
    };

    const handleLooksGood = () => {
        if (capturedPhoto) {
            setCurrentStep(3);
        }
    };

    const handleConfirm = () => {
        if (capturedPhoto) {
            setCurrentStep(4);
            processPhoto(capturedPhoto);
        }
    };

    const handleBackFromConfirm = () => {
        setCurrentStep(2);
    };

    const renderStepIndicator = () => {
        return (
            <View style={styles.stepIndicatorContainer}>
                {[1, 2, 3, 4].map((step) => (
                    <View
                        key={step}
                        style={[
                            styles.stepDot,
                            step <= currentStep && styles.stepDotActive,
                        ]}
                    />
                ))}
            </View>
        );
    };

    if (isProcessing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#B3D6FF', '#91C6FF', '#D2D1FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.processingContainer}
                >
                    <View style={styles.processingCard}>
                        <LinearGradient
                            colors={['#9b5de5', '#8b4fd9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.processingIconContainer}
                        >
                            <Text style={styles.processingIcon}>📖</Text>
                        </LinearGradient>
                        <Text style={styles.processingTitle}>{t('camera.processing')}</Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Step 3: Ready to Process Screen
    if (capturedPhoto && currentStep === 3) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleBackFromConfirm}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={24} color="#000" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        {renderStepIndicator()}
                    </View>

                    {/* Title and Subtitle */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Ready to Process</Text>
                        <Text style={styles.subtitle}>AI will analyze and summarize</Text>
                    </View>

                    {/* Privacy Notice Card */}
                    <View style={styles.privacyCardContainer}>
                        <View style={styles.privacyCard}>
                            <View style={styles.privacyIconContainer}>
                                <Icon name="security" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.privacyTitle}>Privacy Notice</Text>
                            <Text style={styles.privacyText}>
                                By scanning, you confirm ownership and consent to AI analysis. Images auto-delete in 24hrs—only summaries are saved.
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.reviewButtonContainer}>
                        <TouchableOpacity
                            onPress={handleBackFromConfirm}
                            style={styles.retakeButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.retakeButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={styles.looksGoodButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.looksGoodButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Step 2: Photo Review Screen
    if (capturedPhoto) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleBack}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={24} color="#000" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        {renderStepIndicator()}
                    </View>

                    {/* Title and Subtitle */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Review Photo</Text>
                        <Text style={styles.subtitle}>Check if text is clear</Text>
                    </View>

                    {/* Photo Preview */}
                    <View style={styles.cameraViewContainer}>
                        <Image
                            source={{ uri: capturedPhoto }}
                            style={styles.capturedImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.reviewButtonContainer}>
                        <TouchableOpacity
                            onPress={handleRetake}
                            style={styles.retakeButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLooksGood}
                            style={styles.looksGoodButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.looksGoodButtonText}>Looks Good</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color="#000" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    {renderStepIndicator()}
                </View>

                {/* Title and Subtitle */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Position Your Mail</Text>
                    <Text style={styles.subtitle}>Ensure all text is visible</Text>
                </View>

                {/* Camera View */}
                <View style={styles.cameraViewContainer}>
                    <View style={styles.cameraPreviewBox}>
                        <Icon name="photo-camera" size={64} color="#6B7280" />
                        <Text style={styles.cameraViewText}>Camera view</Text>
                    </View>
                </View>

                {/* Take Photo Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleTakePhoto}
                        style={styles.takePhotoButton}
                        activeOpacity={0.8}
                    >
                        <Icon name="photo-camera" size={24} color="#FFF" />
                        <Text style={styles.takePhotoButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '400',
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    stepDotActive: {
        backgroundColor: '#3B82F6',
    },
    titleContainer: {
        paddingTop: hp(4),
        paddingBottom: hp(3),
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '400',
    },
    cameraViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(6),
    },
    cameraPreviewBox: {
        width: '100%',
        height: hp(55),
        backgroundColor: '#F1F5F9',
        borderWidth:1,
        borderColor:'#D8DCDF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraViewText: {
        marginTop: hp(2),
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '400',
    },
    buttonContainer: {
        paddingHorizontal: wp(6),
        paddingBottom: hp(4),
        paddingTop: hp(2),
    },
    takePhotoButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(2),
        borderRadius: 50,
        gap: 10,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    takePhotoButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    reviewButtonContainer: {
        flexDirection: 'row',
        paddingHorizontal: wp(6),
        paddingBottom: hp(4),
        paddingTop: hp(2),
        gap: 12,
    },
    retakeButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingVertical: hp(2),
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retakeButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
    },
    looksGoodButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        paddingVertical: hp(2),
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    looksGoodButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    // Processing Screen Styles
    processingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingCard: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: wp(7),
        padding: wp(8),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.7) },
        shadowOpacity: 0.13,
        shadowRadius: wp(4),
        elevation: 8,
    },
    processingIconContainer: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    processingIcon: {
        fontSize: wp(10),
    },
    processingTitle: {
        color: '#1f2937',
        fontSize: wp(5.5),
        fontWeight: 'bold',
        marginBottom: hp(3),
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        marginBottom: hp(2),
    },
    progressBar: {
        width: '100%',
        height: hp(1.5),
        backgroundColor: '#e5e7eb',
        borderRadius: hp(0.75),
        overflow: 'hidden',
        marginBottom: hp(1.5),
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#9b5de5',
        borderRadius: hp(0.75),
    },
    progressText: {
        fontSize: wp(4),
        color: '#9b5de5',
        fontWeight: '600',
        textAlign: 'center',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    privacyCardContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: wp(6),
    },
    privacyCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: wp(6),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    privacyIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    privacyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: hp(1.5),
    },
    privacyText: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
        fontWeight: '400',
    },
});