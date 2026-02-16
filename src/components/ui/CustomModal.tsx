import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { fonts } from '../../constants/fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface CustomModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    icon?: React.ReactNode;
    type?: 'error' | 'success' | 'info' | 'warning';
}

export const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    confirmText = 'OK',
    icon,
    type = 'info'
}) => {

    const getIconColor = () => {
        switch (type) {
            case 'error': return '#EF4444';
            case 'success': return '#10B981';
            case 'warning': return '#F59E0B';
            default: return '#000F54';
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onConfirm}
        >
            <View style={styles.centeredView}>
                <View style={styles.backdrop} />
                <View style={styles.modalView}>
                    <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                        {icon || <Icon name="info-outline" size={32} color={getIconColor()} />}
                    </View>

                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#000F54' }]}
                        onPress={onConfirm}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.textStyle}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: width * 0.85,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: fonts.inter.bold,
        color: '#1F2937',
    },
    modalText: {
        marginBottom: 24,
        textAlign: 'center',
        fontSize: 16,
        color: '#6B7280',
        fontFamily: fonts.inter.regular,
        lineHeight: 24,
    },
    button: {
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 24,
        elevation: 2,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000F54',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    textStyle: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: fonts.inter.medium,
    },
});
