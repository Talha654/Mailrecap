const app = require('./src/app');
const config = require('./src/config/env');

if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
}

module.exports = app;
