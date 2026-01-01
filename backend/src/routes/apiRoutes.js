const express = require('express');
const multer = require('multer');
const imageController = require('../controllers/imageController');

const router = express.Router();
const upload = multer({ dest: '/tmp/' });

router.get('/', (req, res) => {
    res.send('MailRecap Backend is running!');
});

router.post('/analyze-image', upload.single('image'), imageController.analyzeImage);

module.exports = router;
