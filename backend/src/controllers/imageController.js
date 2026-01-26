const openaiService = require('../services/openaiService');
const { deleteFile } = require('../utils/fileHandler');

const analyzeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    const filePath = req.file.path;

    try {
        const result = await openaiService.analyzeImage(
            filePath,
            req.file.originalname,
            req.file.mimetype,
            req.body
        );

        res.json(result);

    } catch (error) {
        console.error('Error in image controller:', error);

        // Propagate status code if available (e.g. from OpenAI 403, 429 etc)
        const statusCode = error.status || error.statusCode || 500;
        const errorMessage = error.message || 'Failed to process image';

        res.status(statusCode).json({ error: errorMessage });
    } finally {
        // Clean up uploaded file
        deleteFile(filePath);
    }
};

module.exports = {
    analyzeImage,
};
