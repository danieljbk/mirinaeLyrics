import express from 'express';
const router = express.Router();
import Genius from 'genius-lyrics';
const Client = new Genius.Client();

router.get('/:songTitle', async (req, res) => {
  try {
    const searchResults = await Client.songs.search(req.params.songTitle);

    const songs = [];
    for (let song of searchResults) {
      songs.push({
        title: song.title.replace('(한국어 번역)', '').trimEnd(),
        artist: song.artist.name.replace('(한국어 번역)', '').trimEnd(),
        lyrics: await song.lyrics(),
        imageSrc: song._raw.song_art_image_url,
      });
    }
    res.send(songs);
  } catch (err) {
    res.status(400).send();
  }
});

export default router;
