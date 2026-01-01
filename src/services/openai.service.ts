import { Platform } from 'react-native';

import axios from 'axios';
import Toast from 'react-native-toast-message';

// const LOCAL_IP = '192.168.100.5';

// const DEV_API_URL = Platform.select({
//     ios: `http://${LOCAL_IP}:5001`,
//     android: `http://${LOCAL_IP}:5001`,
// });

const API_URL = 'https://backend-beta-three-41.vercel.app';
// const API_URL = 'http://192.168.100.131:5001';

export interface OpenAIResponse {
    title: string;
    date: string;
    summary: string;
    suggestions: string[];
    fullText: string;
}

export const analyzeImage = async (imagePath: string, targetLanguage: string = 'English'): Promise<OpenAIResponse> => {
    try {
        const formData = new FormData();

        const filename = imagePath.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: Platform.OS === 'ios' ? imagePath.replace('file://', '') : imagePath,
            name: filename,
            type,
        } as any);

        // Add target language to the request
        formData.append('target_language', targetLanguage);

        console.log('Sending image to backend:', API_URL, '| Language:', targetLanguage);

        const response = await axios.post(`${API_URL}/analyze-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error: any) {
        console.error('OpenAI Service Error:', error);

        let errorMessage = 'Failed to analyze image. Please try again.';
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'Network error. Please check your connection.';
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message;
        }

        Toast.show({
            type: 'error',
            text1: 'Analysis Failed',
            text2: errorMessage,
            position: 'bottom',
            visibilityTime: 4000,
        });

        throw error;
    }
};
