import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { hp, wp, COLORS } from '../../constants/StyleGuide';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    errorText?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    containerStyle,
    inputStyle,
    errorText,
    ...textInputProps
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                placeholderTextColor="#9AA3AF"
                style={[
                    styles.input,
                    inputStyle,
                    isFocused && styles.inputFocused
                ]}
                onFocus={(e) => {
                    setIsFocused(true);
                    textInputProps.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    textInputProps.onBlur?.(e);
                }}
                {...textInputProps}
            />
            {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: hp(0.8),
        color: '#111827',
        fontSize: wp(3.8),
        fontWeight: '600',
    },
    input: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        borderWidth: 2,
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(4),
        borderRadius: wp(3.5),
        fontSize: wp(4),
        color: '#111827',
    },
    inputFocused: {
        borderColor: '#000F54',
    },
    error: {
        marginTop: hp(0.8),
        color: '#DC2626',
        fontSize: wp(3.4),
    },
});

export default CustomInput;


