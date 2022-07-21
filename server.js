import mongoose from 'mongoose';
import cors from 'cors';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

const app = express();
const __dirname = path.resolve();
dotenv.config();

// open livereload high port and start to watch public directory for changes
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => {
  console.log('Connected to database');
});

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.json({ limit: '1mb' })); // allow bigger file transfers
app.use(express.urlencoded({ limit: '1mb', extended: true })); // allow bigger file transfers
app.use(cors({ origin: '*' }));
app.use(connectLivereload());
app.use(compression()); // much smaller file size. gzips project.

// send the user to index html page in spite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

import searchRouter from './src/routes/search.js';
app.use('/search/', searchRouter);

import mirinaeRouter from './src/routes/mirinae.js';
app.use('/mirinae/', mirinaeRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  if (process.send) {
    process.send('online');
  }
  console.log('Server has started on port ' + port);
});
