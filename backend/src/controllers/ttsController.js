const OpenAI = require('openai');
const config = require('../config/env');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.generateSpeech = async (req, res) => {
    try {
        const { text, voice = 'cedar', speed = 1.0 } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 4096) {
            return res.status(400).json({ error: 'Text is too long (max 4096 characters)' });
        }

        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: voice,
            input: text,
            speed: speed,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
        });

        res.send(buffer);

    } catch (error) {
        console.error('Error generating speech:', error);
        res.status(500).json({
            error: 'Failed to generate speech',
            details: error.message
        });
    }
};
