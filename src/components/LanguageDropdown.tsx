import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    ScrollView,
} from 'react-native';
import { Globe, ChevronDown, Check, ChevronUp } from 'lucide-react-native';
import { wp, hp } from '../constants/StyleGuide';
import { fonts } from '../constants/fonts';

interface LanguageOption {
    label: string;
    value: string;
}

interface LanguageDropdownProps {
    selectedLanguage?: string;
    onSelect?: (language: string) => void;
    options?: LanguageOption[];
}

const DEFAULT_LANGUAGES = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'Creole', value: 'ht' },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
    selectedLanguage = 'en',
    onSelect,
    options = DEFAULT_LANGUAGES,
}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownRight, setDropdownRight] = useState(0); // We'll align right
    const triggerRef = useRef<View>(null);

    const toggleDropdown = () => {
        if (visible) {
            setVisible(false);
        } else {
            openDropdown();
        }
    };

    const openDropdown = () => {
        triggerRef.current?.measure((_fx, _fy, w, h, _px, py) => {
            setDropdownTop(py + h + hp(1)); // Add a little spacing
            // For right alignment, we can just use the right margin of the screen or calculate based on width
            // But since we are in a modal, we can position absolute.
            // Let's try to align it with the trigger.
            // However, the design shows the dropdown might be wider or same width.
            // Let's just position it relative to the top right of the screen or the trigger.
            // The trigger is in the top right.
            setVisible(true);
        });
    };

    const handleSelect = (lang: string) => {
        onSelect?.(lang);
        setVisible(false);
    };

    const renderDropdown = () => {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.overlay}>
                        <View
                            style={[
                                styles.dropdown,
                                {
                                    top: dropdownTop,
                                    right: wp(8), // Align with the screen padding
                                },
                            ]}
                        >
                            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                                {options.map((lang, index) => (
                                    <TouchableOpacity
                                        key={lang.value}
                                        style={[
                                            styles.item,
                                            index === options.length - 1 && styles.lastItem,
                                        ]}
                                        onPress={() => handleSelect(lang.value)}
                                    >
                                        <Text style={styles.itemText}>{lang.label}</Text>
                                        {selectedLanguage === lang.value && (
                                            <Check size={20} color="#5F6F87" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

    return (
        <View ref={triggerRef} collapsable={false}>
            <TouchableOpacity
                style={styles.trigger}
                onPress={toggleDropdown}
                activeOpacity={0.7}
            >
                <Globe size={20} color="#5F6F87" strokeWidth={2} />
                <Text style={styles.triggerText}>
                    {options.find(l => l.value === selectedLanguage)?.label || selectedLanguage}
                </Text>
                {visible ? (
                    <ChevronUp size={20} color="#9CA3AF" />
                ) : (
                    <ChevronDown size={20} color="#9CA3AF" />
                )}
            </TouchableOpacity>
            {renderDropdown()}
        </View>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        borderRadius: wp(8),
        gap: wp(2),
        minWidth: wp(35),
        justifyContent: 'space-between',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 2,
    },
    triggerText: {
        fontSize: wp(4),
        fontFamily: fonts.sourceSerif.semiBold,
        color: '#000F54',
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: wp(6),
        width: wp(50),
        paddingVertical: hp(1),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        maxHeight: hp(40),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(5),
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemText: {
        fontSize: wp(4),
        fontFamily: fonts.sourceSerif.regular,
        color: '#000F54',
    },
});
