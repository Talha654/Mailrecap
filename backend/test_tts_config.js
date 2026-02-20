require('dotenv').config({ path: './.env' }); // Adjust path if .env is in backend root
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testTTS() {
    console.log("Testing OpenAI TTS with model='gpt-4o-mini-tts' and voice='cedar'...");
    try {
        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "cedar",
            input: "Hello, this is a test of the cedar voice.",
            speed: 1.0,
        });
        console.log("Success! Audio generated.");
    } catch (error) {
        console.error("Failed!");
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

testTTS();
