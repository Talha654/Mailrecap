const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');

router.post('/', ttsController.generateSpeech);

module.exports = router;
