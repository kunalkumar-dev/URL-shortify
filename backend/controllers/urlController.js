const UrlModel = require('../models/URL');

// Validate URL format using the global URL constructor
function isValidUrl(string) {
  try {
    // Use global URL constructor to avoid name collision with the model
    new globalThis.URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Shorten URL
exports.shortenUrl = async (req, res) => {
  try {
    let { originalUrl } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Trim whitespace
    originalUrl = originalUrl.trim();

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format. Please enter a valid URL.' });
    }

    // Check if URL already exists (to prevent duplicates)
    const existingUrl = await UrlModel.findOne({ where: { originalUrl } });
    if (existingUrl) {
      return res.status(200).json({
        shortId: existingUrl.shortId,
        originalUrl: existingUrl.originalUrl,
        shortUrl: `${process.env.API_BASE_URL || '/api'}/urls/${existingUrl.shortId}`,
        message: 'This URL was already shortened!',
      });
    }

    // Create URL document (without userId)
    const urlDoc = await UrlModel.create({ originalUrl });

    res.status(201).json({
      shortId: urlDoc.shortId,
      originalUrl: urlDoc.originalUrl,
      shortUrl: `${process.env.API_BASE_URL || '/api'}/urls/${urlDoc.shortId}`,
    });
  } catch (error) {
    console.error('Error in shortenUrl:', error);
    res.status(500).json({ error: 'Failed to shorten URL. Please try again.' });
  }
};

// Redirect to original URL
exports.redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const urlDoc = await UrlModel.findOne({ where: { shortId } });
    if (!urlDoc) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if URL expired
    if (urlDoc.expiresAt && new Date() > urlDoc.expiresAt) {
      return res.status(410).json({ error: 'This URL has expired' });
    }

    // Increment click count
    await urlDoc.increment('clicks');

    res.redirect(urlDoc.originalUrl);
  } catch (error) {
    console.error('Error in redirectUrl:', error);
    res.status(500).json({ error: 'Failed to redirect. Please try again.' });
  }
};

// Get all URLs
exports.getUserUrls = async (req, res) => {
  try {
    // Get all URLs (not user-specific), sorted by creation date, most recent first
    const urls = await UrlModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    
    res.json({
      success: true,
      count: urls.length,
      data: urls,
    });
  } catch (error) {
    console.error('Error in getUserUrls:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
};

// Delete URL
exports.deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    if (!shortId) {
      return res.status(400).json({ error: 'Short ID is required' });
    }

    const urlDoc = await UrlModel.findOne({ where: { shortId } });
    if (!urlDoc) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    await urlDoc.destroy();

    res.json({ 
      success: true,
      message: 'URL deleted successfully',
      deletedId: shortId,
    });
  } catch (error) {
    console.error('Error in deleteUrl:', error);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
};
