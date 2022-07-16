import express from 'express';
const router = express.Router();
import axios from 'axios';
import request from 'request';
import stringSimilarity from 'string-similarity';
import arrayUnion from 'array-union';
import dotenv from 'dotenv';
dotenv.config();

import SpotifyWebApi from 'spotify-web-api-node';
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri: 'http://www.example.com/callback',
});

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    Authorization:
      'Basic ' +
      new Buffer.from(clientId + ':' + clientSecret).toString('base64'),
  },
  form: {
    grant_type: 'client_credentials',
  },
  json: true,
};

router.get('/html', async (req, res) => {
  const koreanTitle = req.query.koreanTitle;
  const artistName = req.query.artistName;

  request.post(authOptions, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      spotifyApi.setAccessToken(body.access_token);

      const pickSongAndCollectHtml = async (songResults) => {
        const spotifySongs = [];
        for (let item of songResults) {
          spotifySongs.push(item.artists[0].name + ' ' + item.name);
        }
        const matches = stringSimilarity.findBestMatch(
          artistName + ' ' + koreanTitle,
          spotifySongs
        );
        const bestMatch = matches.bestMatch.target;

        for (let item of songResults) {
          if (item.artists[0].name + ' ' + item.name === bestMatch) {
            const songUrl = item.external_urls.spotify;

            try {
              await axios
                .get('https://open.spotify.com/' + 'oembed', {
                  params: { url: songUrl },
                })
                .then((result) => result.data)
                .then((data) => {
                  return res.json({ html: data.html });
                });
            } catch (err) {
              return res.status(400).send();
            }
            break;
          }
        }
      };

      const resError = () => {
        return res.status(400).send();
      };

      // search the spotify api with the track namespotifyApi
      spotifyApi
        .searchTracks(koreanTitle, {
          limit: 25,
          offset: 0,
        })
        .then((data) => {
          const songResultsFromTitle = data.body.tracks.items;
          spotifyApi
            .searchTracks(koreanTitle + ' ' + artistName, {
              limit: 25,
              offset: 0,
            })
            .then((data) => {
              const songResultsFromTitleAndArtistName = data.body.tracks.items;
              spotifyApi
                .searchTracks('artist:' + artistName, { limit: 50, offset: 0 })
                .then(async (data) => {
                  const songResultsFromArtistName = data.body.tracks.items;
                  const combinedSongResults = arrayUnion(
                    songResultsFromTitle,
                    songResultsFromArtistName,
                    songResultsFromTitleAndArtistName
                  );
                  if (combinedSongResults.length === 0) {
                    resError();
                  } else {
                    pickSongAndCollectHtml(combinedSongResults);
                  }
                });
            });
        });
    }
  });
});

export default router;
