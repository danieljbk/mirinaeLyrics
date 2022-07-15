const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  koreanTitle: { type: String, required: true },
  englishTitle: { type: String, required: true },
  englishLyrics: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('Song', songSchema);
