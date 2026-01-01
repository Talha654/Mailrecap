const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Path to the test image
const imagePath = '/Users/talhasiddiqui/.gemini/antigravity/brain/ddd7b2ea-51be-4e66-96de-04a9306cf37c/test_receipt_1764331847237.png';

const runDemo = () => {
    console.log('Sending image to API...');

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/analyze-image',
        method: 'POST',
        headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\n--- API RESPONSE ---');
            try {
                const jsonResponse = JSON.parse(data);
                console.log(JSON.stringify(jsonResponse, null, 2));
            } catch (e) {
                console.log(data);
            }
            console.log('--------------------\n');
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    form.pipe(req);
};

runDemo();
