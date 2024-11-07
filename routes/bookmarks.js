const express = require('express');
const fetchMetadata = require('metadata-scraper');
const Bookmark = require('../models/bookmark');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Add Bookmark
router.post('/add', async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.userId;
    const metadata = await fetchMetadata(url);

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

// Get All Bookmarks
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const bookmarks = await Bookmark.find({ userId });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookmarks', error });
  }
});

// Delete Bookmark
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    if (bookmark.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Bookmark.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bookmark', error });
  }
});

// Edit Bookmark
router.put('/:id', async (req, res) => {
  try {
    const { url, image, title, description, tags } = req.body;
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    if (bookmark.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    bookmark.url = url || bookmark.url;
    bookmark.image = image || bookmark.image;
    bookmark.title = title || bookmark.title;
    bookmark.description = description || bookmark.description;
    bookmark.tags = tags ? tags.split(',') : bookmark.tags;

    await bookmark.save();
    res.status(200).json({ message: 'Bookmark updated successfully', bookmark });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ message: 'Error updating bookmark', error });
  }
});

module.exports = router;
