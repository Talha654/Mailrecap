const axios = require('axios');

const runTest = async () => {
    console.log('Testing Axios...');
    try {
        const response = await axios.get('http://localhost:3000');
        console.log('Axios GET success. Status:', response.status);
    } catch (error) {
        // It's okay if it fails to connect to localhost:3000 if server is down, 
        // but we want to see if axios itself loads and runs.
        if (error.code === 'ECONNREFUSED') {
            console.log('Axios loaded, but server is down (ECONNREFUSED). This is expected if server is not running.');
        } else {
            console.log('Axios error:', error.message);
        }
    }
};

runTest();
