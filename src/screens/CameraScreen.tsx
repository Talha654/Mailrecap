import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import { hp, wp } from '../constants/StyleGuide';
import { CustomButton } from '../components/ui/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { SCREENS } from '../navigation/screens';

export interface MailItem {
    id: string;
    title: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    date: string;
    photoUrl?: string;
}

export const CameraScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCamera, setShowCamera] = useState(true);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
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
                processPhoto();
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
                processPhoto();
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

    const processPhoto = () => {
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
                setTimeout(() => {
                    setIsProcessing(false);
                    setProgress(0);
                    setShowCamera(true);

                    // Simulate processing a new mail item
                    const newMailItem: MailItem = {
                        id: Date.now().toString(),
                        title: 'New Mail Item',
                        summary: 'This letter is about a subscription renewal for your magazine. It costs $29.99 per year.',
                        fullText: 'Dear Subscriber, We hope you have enjoyed your magazine subscription. Your subscription will expire next month. To continue receiving your magazine, please renew for $29.99 per year.',
                        suggestions: ['Renew subscription online', 'Call customer service', 'Consider digital subscription instead'],
                        date: new Date().toISOString().split('T')[0]
                    };

                    setMailItems(prev => [newMailItem, ...prev]);

                    // Navigate to MailSummaryScreen with the new mail item
                    navigation.navigate(SCREENS.MAIL_SUMMARY, { mailItem: newMailItem });
                }, 500);
            }
        }, 200);
    };

    const handleBack = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        navigation.goBack();
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

    return (
        <SafeAreaView style={styles.safeAreaDark}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>← {t('camera.back')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions Text */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                        {t('camera.instructions')}
                    </Text>
                </View>

                {/* Camera View */}
                <View style={styles.cameraViewContainer}>
                    <View style={styles.cameraPreviewBox}>
                        {/* Dotted Border */}
                        <View style={styles.dottedBorder} />

                        {/* Placeholder Content */}
                        {showCamera ? (
                            <View style={styles.cameraPlaceholder}>
                                {/* Sample Mail Image */}
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1627618998627-70a92a874cc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2lhbCUyMGxldHRlciUyMGVudmVsb3BlJTIwbWFpbCUyMGRvY3VtZW50fGVufDF8fHx8MTc1ODEzMDMyN3ww&ixlib=rb-4.1.0&q=80&w=400' }}
                                    style={styles.sampleImage}
                                />

                                {/* Sample Watermark */}
                                <View style={styles.watermarkContainer}>
                                    <View style={styles.watermark}>
                                        <Text style={styles.watermarkText}>SAMPLE</Text>
                                    </View>
                                </View>

                                {/* Camera Icon Overlay */}
                                <View style={styles.cameraIconOverlay}>
                                    <View style={styles.cameraIconCircle}>
                                        <Text style={styles.cameraIconText}>📷</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoIcon}>📄</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <CustomButton
                        title={`📷 ${t('camera.takePicture')}`}
                        onPress={handleTakePhoto}
                        style={styles.takePictureButton}
                        textStyle={styles.takePictureButtonText}
                    />

                    <TouchableOpacity
                        onPress={handleChoosePhoto}
                        style={styles.choosePhotoButton}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.choosePhotoButtonText}>
                            📱 {t('camera.choosePhoto')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    safeAreaDark: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        borderRadius: wp(4),
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.3) },
        shadowOpacity: 0.2,
        shadowRadius: wp(1.5),
        elevation: 4,
    },
    backButtonText: {
        color: '#1f2937',
        fontSize: wp(4),
        fontWeight: '600',
    },
    instructionsContainer: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: wp(6),
        paddingVertical: hp(2),
    },
    instructionsText: {
        color: '#fff',
        fontSize: wp(4.2),
        lineHeight: hp(3),
        textAlign: 'center',
        maxWidth: wp(85),
        alignSelf: 'center',
    },
    cameraViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(6),
    },
    cameraPreviewBox: {
        width: '100%',
        maxWidth: wp(85),
        aspectRatio: 4 / 3,
        position: 'relative',
    },
    dottedBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderStyle: 'dashed',
        borderRadius: wp(4),
        zIndex: 10,
    },
    cameraPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2d2d2d',
        borderRadius: wp(4),
        overflow: 'hidden',
        position: 'relative',
    },
    sampleImage: {
        width: '100%',
        height: '100%',
        borderRadius: wp(4),
        opacity: 0.4,
    },
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    watermark: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    watermarkText: {
        color: '#fff',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    cameraIconOverlay: {
        position: 'absolute',
        top: hp(2),
        right: wp(4),
    },
    cameraIconCircle: {
        width: wp(10),
        height: wp(10),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconText: {
        fontSize: wp(5),
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e5e5',
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIcon: {
        fontSize: wp(16),
    },
    controlsContainer: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: wp(6),
        paddingVertical: hp(3),
    },
    takePictureButton: {
        backgroundColor: '#9b5de5',
        paddingVertical: hp(2.5),
        borderRadius: wp(7),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.3,
        shadowRadius: wp(2),
        elevation: 6,
    },
    takePictureButtonText: {
        fontSize: wp(5.5),
    },
    choosePhotoButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: hp(2),
        borderRadius: wp(7),
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    choosePhotoButtonText: {
        color: '#fff',
        fontSize: wp(4.5),
        fontWeight: 'bold',
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
});