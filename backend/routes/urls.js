const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// Get all URLs - MUST come before /:shortId
router.get('/user/all', urlController.getUserUrls);

// Create short URL (no auth required)
router.post('/shorten', urlController.shortenUrl);

// Get short URL (redirect) - this is a catch-all, so it goes last
router.get('/:shortId', urlController.redirectUrl);

// Delete URL
router.delete('/:shortId', urlController.deleteUrl);

module.exports = router;
