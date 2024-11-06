const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmarks');

const app = express();
const PORT = process.env.PORT || 5000;
// 
mongoose.connect('mongodb+srv://shashiverma:xVJReikGGdROr5Qy@bookmarkmanager.zvyzf.mongodb.net/bookmarkManager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(cors());
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).send('Something broke!'); });
app.use('/auth', authRoutes);
app.use('/bookmarks', bookmarkRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
