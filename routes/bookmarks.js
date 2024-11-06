const express = require('express');
const fetchMetadata = require('metadata-scraper');
const Bookmark = require('../models/bookmark');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/add', async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.userId;
    const metadata = await fetchMetadata(url);

    console.log("===",metadata)

    const newBookmark = new Bookmark({
      userId,
      url,
      title: metadata.title || 'No title available',
      description: metadata.description || 'No description available',
      image: metadata.image || 'No image available',
      tags: metadata.tags ? metadata.tags.split(',') : ['No tags'],
    });

    await newBookmark.save();
    res.status(200).json({ message: 'Bookmark added successfully', bookmark: newBookmark });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ message: 'Error adding bookmark', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const bookmarks = await Bookmark.find({ userId });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookmarks', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bookmark', error });
  }
});

module.exports = router;
