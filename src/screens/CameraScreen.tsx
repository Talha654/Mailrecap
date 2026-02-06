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
import { fonts } from '../constants/fonts';
import { Shield } from 'lucide-react-native';
import { icons } from '../constants/images';
import { analyzeImage } from '../services/openai.service';
import Toast from 'react-native-toast-message';
import { useSubscription } from '../hooks/useSubscription';

import { MailItem } from '../types/mail';


export const CameraScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const { scansLeft, subscriptionPlan } = useSubscription(); // Use subscription hook
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
        // Check for scan limits
        // 0 scans left AND not on an unlimited plan (which behaves as -1, but let's be safe with explicit check)
        // Actually, if scansLeft is 0, it means they ran out. Unlimited plans would return -1 or a high number.
        // Based on implementation: Plus plans scansRemaining = -1.
        // useSubscription returns scansLeft directly from DB.
        // So we only block if scansLeft === 0.
        if (scansLeft === 0) {
            Toast.show({
                type: 'error',
                text1: 'Zero Scans Left',
                text2: 'You have 0 scans left. Please update the plan.',
            });
            return;
        }

        try {
            const image = await ImagePicker.openCamera({
                width: 1200,
                height: 1600,
                // cropping: true,
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
                    console.log(t('camera.userCancelled'));
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

    // const handleChoosePhoto = async () => {
    //     try {
    //         const image = await ImagePicker.openPicker({
    //             width: 1200,
    //             height: 1600,
    //             cropping: true,
    //             cropperCircleOverlay: false,
    //             compressImageQuality: 0.8,
    //             includeBase64: false,
    //             mediaType: 'photo',
    //         });

    //         if (image) {
    //             console.log('Image selected:', image.path);
    //             processPhoto(image.path);
    //         }
    //     } catch (error: unknown) {
    //         if (error instanceof Error && 'code' in error) {
    //             const errorWithCode = error as { code: string; message: string };
    //             if (errorWithCode.code === 'E_PICKER_CANCELLED') {
    //                 console.log('User cancelled image picker');
    //             } else {
    //                 console.log('Image Picker Error:', errorWithCode.message);
    //                 Alert.alert('Error', 'Failed to select image. Please try again.');
    //             }
    //         } else {
    //             console.log('Image Picker Error:', error);
    //             Alert.alert('Error', 'Failed to select image. Please try again.');
    //         }
    //     }
    // };

    const processPhoto = async (photoPath: string) => {
        setIsProcessing(true);
        setShowCamera(false);

        // Simulate processing with progress for UI feedback
        let currentProgress = 0;
        progressInterval.current = setInterval(() => {
            if (currentProgress < 90) {
                currentProgress += 5;
                setProgress(currentProgress);
            }
        }, 500);

        try {
            // Map i18n language codes to full language names
            const languageMap: { [key: string]: string } = {
                'en': 'English',
                'es': 'Spanish',
                'ht': 'Haitian Creole'
            };

            const targetLanguage = languageMap[i18n.language] || 'English';
            console.log('[CameraScreen] Selected language:', i18n.language, '→', targetLanguage);

            // Call OpenAI Backend with the user's selected language
            const analysisResult = await analyzeImage(photoPath, targetLanguage);

            console.log('analysisResult=>>>>>>>>>>', analysisResult);

            // Complete the progress bar
            if (progressInterval.current) clearInterval(progressInterval.current);
            setProgress(100);

            setTimeout(async () => {
                try {
                    const mailSummaryData = {
                        title: analysisResult.title || 'Scanned Mail',
                        summary: analysisResult.summary,
                        fullText: analysisResult.fullText,
                        suggestions: analysisResult.suggestions,
                        photoUrl: photoPath,
                        date: analysisResult.date || new Date().toISOString().split('T')[0],
                        links: analysisResult.links,
                        category: analysisResult.category,
                        actionableDate: analysisResult.actionableDate,
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
                        links: savedSummary.links,
                        category: savedSummary.category,
                        actionableDate: savedSummary.actionableDate,
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

        } catch (error) {
            if (progressInterval.current) clearInterval(progressInterval.current);
            console.error('[CameraScreen] Error analyzing image:', error);
            setIsProcessing(false);
            setProgress(0);
            setShowCamera(true);
            // Alert.alert('Error', 'Failed to analyze image. Please check your internet connection and try again.');
            // Error is handled by the service with a Toast message
        }
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
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={styles.processingCard}>
                    <LinearGradient
                        colors={['#D6212F', '#D6212F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.processingIconContainer}
                    >
                        <Image source={icons.file} style={styles.processingIcon} resizeMode='contain' />
                    </LinearGradient>
                    <Text style={styles.processingTitle}>{t('camera.processing')}</Text>
                    <Text style={styles.processingSubTitle}>{t('camera.processingSubTitle')}</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                </View>
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
                        <Text style={styles.title}>{t('camera.readyToProcess')}</Text>
                        <Text style={styles.subtitle}>{t('camera.aiAnalyze')}</Text>
                    </View>

                    {/* Privacy Notice Card */}
                    <View style={styles.privacyCardContainer}>
                        <View style={styles.privacyCard}>
                            <View style={styles.privacyIconContainer}>
                                <Shield color="#FFFFFF" size={wp(10)} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.privacyTitle}>{t('camera.privacyNoticeTitle')}</Text>
                            <Text style={styles.privacyText}>
                                {t('camera.privacyNoticeDesc')}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.reviewButtonContainer}>
                        <TouchableOpacity
                            onPress={handleRetake}
                            style={styles.retakeButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.retakeButtonText}>{t('camera.back')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={styles.looksGoodButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.looksGoodButtonText}>{t('camera.confirm')}</Text>
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
                            <Text style={styles.retakeButtonText}>{t('camera.retake')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLooksGood}
                            style={styles.looksGoodButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.looksGoodButtonText}>{t('camera.looksGood')}</Text>
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
                        <Text style={styles.takePhotoButtonText}>{t('camera.takePicture')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E9EFF5',
    },
    container: {
        flex: 1,
        backgroundColor: '#E9EFF5',
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
        color: '#000F54',
        fontSize: 18,
        fontFamily: fonts.inter.regular,
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
        backgroundColor: '#D6212F',
    },
    titleContainer: {
        paddingTop: hp(4),
        paddingBottom: hp(3),
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.inter.bold,
        color: '#000F54',
        marginBottom: hp(1),
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fonts.inter.regular,
        color: '#9CA3AF',
    },
    cameraViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(6),
    },
    cameraPreviewBox: {
        width: '100%',
        flex: 1, // Fill available vertical space
        // height: hp(55), // Removed fixed height
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#D8DCDF',
        borderRadius: 14,
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
        backgroundColor: '#000F54',
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
        borderColor: '#000F54',
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
        backgroundColor: '#000F54',
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
        alignSelf: 'center', // Ensure container is centered in card
    },
    processingIcon: {
        width: wp(10),
        height: wp(10),
        marginRight: wp(2),
        tintColor: '#fff',
        alignSelf: 'center', // Ensure icon is centered in gradient
    },
    processingTitle: {
        color: '#1f2937',
        fontSize: wp(5.5),
        fontFamily: fonts.inter.bold,
        marginBottom: hp(1),
        textAlign: 'center',
    },
    processingSubTitle: {
        color: '#64738B',
        fontSize: wp(4),
        fontFamily: fonts.inter.regular,
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
        backgroundColor: '#D6212F',
        borderRadius: hp(0.75),
    },
    progressText: {
        fontSize: wp(4),
        color: '#D6212F',
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
        paddingHorizontal: wp(6),
    },
    privacyCard: {
        backgroundColor: '#F8FAFC',
        marginTop: hp(4),
        borderRadius: 20,
        padding: wp(6),
        height: hp(40),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: "space-around"
    },
    privacyIconContainer: {
        width: wp(20),
        height: wp(20),
        borderRadius: 12,
        backgroundColor: '#D6212F',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
        alignSelf: 'center'
    },
    privacyTitle: {
        fontSize: wp(7),
        fontWeight: '700',
        color: '#000',
        marginBottom: hp(1.5),
        alignSelf: 'center'
    },
    privacyText: {
        fontSize: wp(4.5),
        color: '#13181fff',
        lineHeight: 22,
        fontFamily: fonts.inter.regular
    },
});