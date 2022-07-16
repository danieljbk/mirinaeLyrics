import express from 'express';
const router = express.Router();
import Genius from 'genius-lyrics';
const Client = new Genius.Client();

router.get('/:songTitle', async (req, res) => {
  try {
    const searches = await Client.songs.search(req.params.songTitle);
    const firstSong = searches[0];
    const title = firstSong.title.replace('(한국어 번역)', '').trimEnd();
    const artist = firstSong.artist.name.replace('(한국어 번역)', '').trimEnd();
    const lyrics = await firstSong.lyrics();
    const imageSrc = firstSong.image;

    res.send({ title, artist, lyrics, imageSrc });
  } catch (err) {
    res.status(400).send();
  }
});

export default router;
