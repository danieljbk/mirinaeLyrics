import express from 'express';
const router = express.Router();
import Song from '../models/song.js';

router.get('/:koreanTitle', async (req, res) => {
  const koreanTitle = req.params.koreanTitle;
  try {
    const song = await Song.findOne({ koreanTitle });
    if (!song || song.koreanTitle !== koreanTitle) {
      return res.status(400).send();
    }
    res.status(201).json({
      englishLyrics: song.englishLyrics,
    });
  } catch (e) {
    res.status(400).send();
  }
});

router.put('/:koreanTitle', async (req, res) => {
  const newSong = new Song({
    koreanTitle: req.params.koreanTitle,
    englishLyrics: req.body.englishLyrics,
  });
  try {
    Song.findOne({ koreanTitle: newSong.koreanTitle }, async (err, oldSong) => {
      if (err || !oldSong) {
        // if the old song does not already exist in the database, save the new song
        try {
          await newSong.save();
          res.status(201).send();
        } catch (err) {
          res.status(400).send();
        }
      } else {
        // if the old song already exists in the database, update its values
        try {
          oldSong.englishLyrics = newSong.englishLyrics;

          await oldSong.save();
          res.status(201).send();
        } catch (err) {
          res.status(400).send();
        }
      }
    });
  } catch (err) {
    res.status(400).send();
  }
});

export default router;
