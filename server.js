const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();
const Genius = require('genius-lyrics');
const Client = new Genius.Client();

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));

// send the user to index html page inspite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/:songTitle', async (req, res) => {
  try {
    const searches = await Client.songs.search(req.params.songTitle);
    const firstSong = searches[0];
    const title = firstSong.title;
    const artist = firstSong.artist.name;
    const lyrics = await firstSong.lyrics();
    const imageSrc = firstSong.image;

    res.append('Access-Control-Allow-Origin', ['*']);
    res.send({ title, artist, lyrics, imageSrc });
  } catch (err) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.send({});
  }
});

app.listen(port);
