import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const wp = (percentage: number) => {
    return (percentage * width) / 100;
};

const hp = (percentage: number) => {
    return (percentage * height) / 100;
};

export { wp, hp };

export const COLORS = {
    primary: '#007AFF',
    secondary: '#007AFF',
    tertiary: '#007AFF',
    quaternary: '#007AFF',
    quinary: '#007AFF',
};
