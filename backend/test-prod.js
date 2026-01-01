const fs = require('fs');
const path = require('path');

// Create a dummy image file for testing if one doesn't exist
const testImagePath = path.join(__dirname, 'test-image.txt');
fs.writeFileSync(testImagePath, 'This is a dummy image file content for testing purposes.');

const runTest = async () => {
    console.log('Testing Production Backend API...');

    try {
        const formData = new FormData();
        const file = new Blob(['dummy content'], { type: 'text/plain' });
        formData.append('image', file, 'test.txt');

        const response = await fetch('https://backend-6isri47fp-mobeenikhtiar21s-projects.vercel.app/analyze-image', {
            method: 'POST',
            body: formData
        });

        if (response.status === 400 || response.status === 500 || response.ok) {
            console.log('Server is reachable. Status:', response.status);
            if (response.status === 500) {
                console.log('Got 500 as expected (since we sent a text file instead of an image to OpenAI)');
            }
        } else {
            console.error('Server might not be running or is unreachable. Status:', response.status);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
};

runTest();
