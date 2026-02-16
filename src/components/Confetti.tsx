import React, { useEffect, useRef, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Confetti as FastConfetti, ConfettiMethods } from 'react-native-fast-confetti';

interface ConfettiProps {
    trigger: number;
    onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = memo(({ trigger, onComplete }) => {
    const confettiRef = useRef<ConfettiMethods>(null);

    useEffect(() => {
        if (trigger > 0) {
            confettiRef.current?.restart();
            // The library handles its own cleanup/completion usually, 
            // but we can call onComplete after a reasonable time.
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    return (
        <View style={styles.container} pointerEvents="none">
            <FastConfetti
                ref={confettiRef}
                autoplay={false}
                count={50}
                colors={['#001F3F', '#D32F2F', '#E0E0E0']}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999,
    },
});
