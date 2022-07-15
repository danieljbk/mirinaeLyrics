require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const Genius = require('genius-lyrics');
const Client = new Genius.Client();
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => {
  console.log('Connected to database');
});

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:8080' }));

// send the user to index html page in spite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

app.get('/:songTitle', async (req, res) => {
  try {
    const searches = await Client.songs.search(req.params.songTitle);
    const firstSong = searches[0];
    const title = firstSong.title;
    const artist = firstSong.artist.name;
    const lyrics = await firstSong.lyrics();
    const imageSrc = firstSong.image;

    res.send({ title, artist, lyrics, imageSrc });
  } catch (err) {
    res.send({});
  }
});

const songsRouter = require('./src/routes/songs');
app.use('/songs/', songsRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Server has started on port ' + port));
