import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import axios from 'axios';
import { Buffer } from 'buffer';

// Configure Sound
Sound.setCategory('Playback');

const BASE_URL = 'https://backend-beta-three-41.vercel.app';
// const BASE_URL = Platform.select({
//     android: 'http://10.0.2.2:5001',
//     ios: 'http://localhost:5001',
// });

/**
 * Text-to-Speech Service
 * Fetches audio from backend and plays it.
 */
class TTSService {
    private isSpeaking: boolean = false;
    private sound: Sound | null = null;
    private shouldStop: boolean = false;
    private onFinishCallback?: () => void;

    async initialize(): Promise<void> {
        // No specific initialization needed for this approach
        // sound object is created per playback
    }

    async speak(
        text: string,
        onStart?: () => void,
        onFinish?: () => void,
        onError?: (error: any) => void
    ): Promise<void> {
        try {
            await this.stop();
            this.shouldStop = false;
            this.onFinishCallback = onFinish;

            const filePath = await this.downloadAudio(text);

            if (this.shouldStop) return;

            this.playAudio(filePath, onStart, onError);

        } catch (error) {
            console.error('TTS speak error:', error);
            if (onError) onError(error);
        }
    }

    private async downloadAudio(text: string): Promise<string> {
        // Create a unique filename based on text length and some content hash (simplified)
        // ideally use a proper hash but for now simplify
        const safeText = text.slice(0, 20).replace(/[^a-z0-9]/gi, '_');
        const filename = `tts_${safeText}_${Date.now()}.mp3`;
        const path = `${RNFS.CachesDirectoryPath}/${filename}`;

        // Check if file exists (if we had proper hashing we could cache)
        // For now, always download to ensure fresh content or just overwrite

        try {
            const response = await axios.post(`${BASE_URL}/api/tts`, {
                text,
                voice: 'alloy' // Make configurable if needed
            }, {
                responseType: 'arraybuffer' // Important to get raw bytes
            });

            // Write to file
            const buffer = Buffer.from(response.data, 'binary').toString('base64');
            await RNFS.writeFile(path, buffer, 'base64');

            return path;
        } catch (error) {
            console.error('Download audio error:', error);
            throw error;
        }
    }

    private playAudio(path: string, onStart?: () => void, onError?: (error: any) => void) {
        this.sound = new Sound(path, '', (error) => {
            if (error) {
                console.error('Failed to load sound', error);
                if (onError) onError(error);
                return;
            }

            if (this.shouldStop) return;

            this.isSpeaking = true;
            if (onStart) onStart();

            this.sound?.play((success) => {
                this.isSpeaking = false;
                if (success) {
                    if (this.onFinishCallback) this.onFinishCallback();
                } else {
                    console.log('playback failed due to audio decoding errors');
                    if (onError) onError('playback failed');
                }

                // Cleanup
                this.sound?.release();
                this.sound = null;
            });
        });
    }

    async stop(): Promise<void> {
        this.shouldStop = true;
        this.isSpeaking = false;

        if (this.sound) {
            this.sound.stop(() => {
                this.sound?.release();
                this.sound = null;
            });
        }
    }

    getIsSpeaking(): boolean {
        return this.isSpeaking;
    }

    setIsSpeaking(speaking: boolean): void {
        if (!speaking) {
            this.stop();
        }
    }

    removeAllListeners(): void {
        // No listeners to remove for Sound
        this.onFinishCallback = undefined;
    }
}

export const ttsService = new TTSService();
