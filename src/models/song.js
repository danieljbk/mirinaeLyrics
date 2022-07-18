import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  koreanTitle: { type: String, required: true },
  englishLyrics: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default mongoose.model('Song', songSchema);
