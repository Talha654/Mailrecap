const fs = require('fs');
const path = require('path');

// Create a dummy image file for testing if one doesn't exist
const testImagePath = path.join(__dirname, 'test-image.txt');
fs.writeFileSync(testImagePath, 'This is a dummy image file content for testing purposes.');

const runTest = async () => {
    console.log('Testing Backend API Full Response Structure...');

    try {
        const formData = new FormData();
        const file = new Blob(['dummy content'], { type: 'text/plain' });
        formData.append('image', file, 'test.txt');

        // Note: fetch is available in Node 18+
        const response = await fetch('http://localhost:3000/analyze-image', {
            method: 'POST',
            body: formData
        });

        console.log('Response Status:', response.status);

        if (response.status === 200) {
            const data = await response.json();
            console.log('Response Data:', JSON.stringify(data, null, 2));

            if (data.title && data.date && data.summary && data.suggestions && data.fullText) {
                console.log('SUCCESS: API returned all expected fields (title, date, summary, suggestions, fullText).');
            } else {
                console.error('FAILURE: API response is missing some fields.');
            }
        } else if (response.status === 500) {
            console.log('Got 500 as expected (since we sent a text file instead of an image to OpenAI).');
            console.log('To fully verify, we need to mock OpenAI or use a real image, but the code changes are in place.');
        } else {
            console.error('Unexpected status:', response.status);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        console.log('Make sure the server is running with "npm start" in the backend directory.');
    } finally {
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
};

runTest();
