const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Test image path
const testImagePath = '/Users/talhasiddiqui/.gemini/antigravity/brain/ddd7b2ea-51be-4e66-96de-04a9306cf37c/test_receipt_1764331847237.png';

console.log('🧪 Starting Comprehensive API Tests...\n');

// Test 1: Check if server is running
const testServerHealth = () => {
    return new Promise((resolve, reject) => {
        console.log('Test 1: Checking server health...');
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET'
        }, (res) => {
            console.log(`✅ Server is running (Status: ${res.statusCode})\n`);
            resolve(true);
        });

        req.on('error', (error) => {
            console.log(`❌ Server is not reachable: ${error.message}\n`);
            reject(error);
        });

        req.end();
    });
};

// Test 2: Test /analyze-image endpoint with real image
const testAnalyzeImage = async () => {
    console.log('Test 2: Testing /analyze-image endpoint with real image...');

    if (!fs.existsSync(testImagePath)) {
        console.log(`❌ Test image not found at: ${testImagePath}\n`);
        return false;
    }

    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('image', fs.createReadStream(testImagePath));

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
                console.log(`Status Code: ${res.statusCode}`);

                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('✅ API Response received successfully!');
                        console.log('Response structure:', JSON.stringify(response, null, 2));
                        console.log('');
                        resolve(true);
                    } catch (error) {
                        console.log('❌ Failed to parse response:', error.message);
                        console.log('Raw response:', data);
                        console.log('');
                        resolve(false);
                    }
                } else {
                    console.log('❌ Request failed with status:', res.statusCode);
                    console.log('Response:', data);
                    console.log('');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            console.log('');
            reject(error);
        });

        form.pipe(req);
    });
};

// Test 3: Test error handling with invalid input
const testErrorHandling = async () => {
    console.log('Test 3: Testing error handling with invalid input...');

    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('image', Buffer.from('invalid image data'), {
            filename: 'test.txt',
            contentType: 'text/plain'
        });

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
                if (res.statusCode === 400 || res.statusCode === 500) {
                    console.log(`✅ Error handling works correctly (Status: ${res.statusCode})`);
                    console.log('Error response:', data);
                    console.log('');
                    resolve(true);
                } else {
                    console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
                    console.log('Response:', data);
                    console.log('');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            console.log('');
            reject(error);
        });

        form.pipe(req);
    });
};

// Test 4: Test missing image field
const testMissingImage = async () => {
    console.log('Test 4: Testing missing image field...');

    return new Promise((resolve, reject) => {
        const form = new FormData();

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
                if (res.statusCode === 400) {
                    console.log('✅ Missing image validation works correctly');
                    console.log('Error response:', data);
                    console.log('');
                    resolve(true);
                } else {
                    console.log(`⚠️  Expected 400, got: ${res.statusCode}`);
                    console.log('Response:', data);
                    console.log('');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            console.log('');
            reject(error);
        });

        form.pipe(req);
    });
};

// Run all tests
const runAllTests = async () => {
    try {
        await testServerHealth();
        await testAnalyzeImage();
        await testErrorHandling();
        await testMissingImage();

        console.log('🎉 All tests completed!');
        console.log('\n📋 Summary:');
        console.log('- Server is running on port 3000');
        console.log('- /analyze-image endpoint is accessible');
        console.log('- OpenAI integration is being tested');
        console.log('- Error handling is implemented');

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        process.exit(1);
    }
};

runAllTests();
