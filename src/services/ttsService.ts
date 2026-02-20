import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

import axios from 'axios';
import { Buffer } from 'buffer';
import { getStorage, getAuth } from './firebase';

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
        onError?: (error: any) => void,
        audioPath?: string // New optional parameter
    ): Promise<void> {
        try {
            await this.stop();
            this.shouldStop = false;
            this.onFinishCallback = onFinish;

            const filePath = audioPath || await this.prepareAudio(text);

            if (this.shouldStop) return;

            this.playAudio(filePath, onStart, onError);

        } catch (error) {
            console.error('TTS speak error:', error);
            if (onError) onError(error);
        }
    }

    async prepareAudio(text: string): Promise<string> {
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
                voice: 'cedar' // Make configurable if needed
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

    async verifyAudioFile(path: string): Promise<boolean> {
        try {
            // If it's a remote URL, assume it's valid (or at least we don't need to download it again)
            if (path.startsWith('http://') || path.startsWith('https://')) {
                return true;
            }

            const exists = await RNFS.exists(path);
            return exists;
        } catch (error) {
            console.error('Error verifying audio file:', error);
            return false;
        }
    }

    async uploadAudio(localPath: string): Promise<string> {
        try {
            const filename = localPath.split('/').pop();
            if (!filename) throw new Error('Invalid file path');

            const auth = getAuth();
            const userId = auth.currentUser?.uid;
            console.log('[TTSService] Uploading audio. UserId:', userId);

            if (!userId) {
                console.warn('[TTSService] User not authenticated, cannot upload audio to user-scoped path.');
                throw new Error('User not authenticated');
            }

            const storageRef = getStorage().ref(`users/${userId}/audio/${filename}`);

            // Upload file
            await storageRef.putFile(localPath);

            // Get download URL
            const url = await storageRef.getDownloadURL();
            console.log('Audio uploaded successfully:', url);

            return url;
        } catch (error) {
            console.error('Error uploading audio:', error);
            throw error;
        }
    }

    async downloadAudio(remoteUrl: string): Promise<string> {
        try {
            // Extract filename from URL and sanitize it to be simple
            // Firebase URLs can be long and contain encoded characters which might cause issues on some platforms
            const rawFilename = remoteUrl.split('/').pop()?.split('?')[0] || `downloaded_${Date.now()}.mp3`;

            // Sanitize filename: replace anything that isn't alphanumeric, dot, or underscore with underscore
            // This handles %2F and other encoded chars that might confuse the filesystem or audio player
            const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

            const localPath = `${RNFS.CachesDirectoryPath}/${safeFilename}`;

            const exists = await RNFS.exists(localPath);
            if (exists) {
                console.log('[TTSService] Audio already cached at:', localPath);
                return localPath;
            }

            console.log('[TTSService] Downloading audio to:', localPath);

            // Use RNFS downloadFile
            const options = {
                fromUrl: remoteUrl,
                toFile: localPath,
                background: true,
                discretionary: true,
            };

            const result = await RNFS.downloadFile(options).promise;

            if (result.statusCode === 200) {
                console.log('[TTSService] Download success');
                return localPath;
            } else {
                throw new Error(`Download failed with status: ${result.statusCode}`);
            }

        } catch (error) {
            console.error('Error downloading audio:', error);
            // Fallback: return the remote URL if download fails, 
            // so at least the player tries to stream it.
            return remoteUrl;
        }
    }

    private playAudio(path: string, onStart?: () => void, onError?: (error: any) => void) {
        console.log('[TTSService] playAudio request for path:', path);
        let finalPath = path;

        if (Platform.OS === 'ios' && !path.startsWith('http') && !path.startsWith('file://')) {
            finalPath = 'file://' + path;
        }

        console.log('[TTSService] loading sound with path:', finalPath);
        this.sound = new Sound(finalPath, '', (error) => {
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
