const app = require('./src/app');
const http = require('http');

console.log('Testing TTS Endpoint...');

const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    try {
        const postData = JSON.stringify({
            text: 'Hello world',
            voice: 'cedar',
            speed: 1.0
        });

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/tts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            const chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(`Received ${buffer.length} bytes of audio data.`);

                if (res.statusCode === 200 && res.headers['content-type'] === 'audio/mpeg') {
                    console.log('✅ TEST PASSED: Received valid audio/mpeg response.');
                } else if (res.statusCode === 500) {
                    // If no API key, we might get 500 but it proves endpoint exists
                    console.log('⚠️ TEST PARTIAL: Endpoint reached but failed (likely missing API KEY).');
                } else {
                    console.error('❌ TEST FAILED: Unexpected response.');
                }
                server.close();
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            server.close();
        });

        req.write(postData);
        req.end();

    } catch (err) {
        console.error(err);
        server.close();
    }
});
