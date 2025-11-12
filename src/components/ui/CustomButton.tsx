import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { hp, wp } from '../../constants/StyleGuide';

interface CustomButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    loading = false,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, style, (disabled || loading) && styles.disabledButton]}
            onPress={onPress}
            activeOpacity={0.85}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[styles.buttonText, textStyle, (disabled || loading) && styles.disabledButtonText]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: '#2E70FF',
        paddingVertical: hp(2),
        borderRadius: wp(10),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        // minHeight: hp(7),
    },
    buttonText: {
        color: '#fff',
        fontSize: wp(5),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    disabledButton: {
        backgroundColor: '#B2CEF0',
    },
    disabledButtonText: {
        color: '#839DC2'
    }
});
