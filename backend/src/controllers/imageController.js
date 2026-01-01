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
        res.status(500).json({ error: 'Failed to process image' });
    } finally {
        // Clean up uploaded file
        deleteFile(filePath);
    }
};

module.exports = {
    analyzeImage,
};
