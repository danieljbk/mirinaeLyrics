'use strict';

const inko = new Inko();

const backendUrl = 'https://herokulyrics.herokuapp.com' + '/';
// const backendUrl = 'http://localhost:8080' + '/';

const searchDiv = document.getElementById('search');
const searchbar = document.getElementById('searchbar');
const loadingText = document.getElementById('loading');
const songTitle = document.getElementById('display-song-title');
const artist = document.getElementById('display-artist-name');
const songImage = document.getElementById('display-song-image');
const errorMsg = document.getElementById('error-message');
const koreanVersion = document.getElementById('korean-version');
const topButtons = document.getElementById('top-buttons');
const topLeftButton = document.getElementById('top-left-button');
const spotifyPlayer = document.getElementById('embedded-spotify-player');

const header = document.getElementById('header');
const logo = document.getElementById('logo');
const songContentDiv = document.getElementById('display-song-content');
const messageDiv = document.getElementById('display-message-text');
const frontPageAreaDiv = document.getElementById('display-front-page');
messageDiv.style.display = 'none';
songContentDiv.style.display = 'none';
frontPageAreaDiv.style.display = 'none';
topButtons.style.display = 'none';

const resetElements = () => {
  loadingText.textContent = '';
  songTitle.textContent = '';
  artist.textContent = '';
  songImage.src = './public/images/transparent.png';
  errorMsg.textContent = '';
  topLeftButton.src = './public/images/transparent.png';

  const koreanLyricsDiv = document.getElementById('korean-lyrics-mirinae');
  while (koreanLyricsDiv.firstChild) {
    koreanLyricsDiv.removeChild(koreanLyricsDiv.lastChild);
  }
};

const textContainsKorean = (text) => {
  let containsKorean = false;

  // get rid of special characters (turns it into an array)
  for (let word of text.match(/[\p{L}-]+/gu)) {
    if (word && word.toLowerCase() === inko.en2ko(word.toLowerCase())) {
      containsKorean = true;
      break;
    }
  }

  return containsKorean;
};
const displayLinkedKoreanLyrics = (lyrics) => {
  const koreanLyricsDiv = document.getElementById('korean-lyrics-mirinae');

  for (let line of lyrics.split('\n')) {
    let textDiv = document.createElement('div');

    let sentenceButton = document.createElement('input');
    sentenceButton.type = 'button';
    sentenceButton.className = 'textButton';

    line = line.trim();
    if (line) {
      sentenceButton.value = line;

      // if the line is not korean, or something like [Verse 1]...
      // there's no need for the mirinae result.
      if (!textContainsKorean(line)) {
        sentenceButton.className = 'textButton disabled';
        sentenceButton.disabled = true;
        textDiv.appendChild(sentenceButton);
        koreanLyricsDiv.appendChild(textDiv);
      } else {
        let image = document.createElement('img');
        image.style.alignSelf = 'center';

        sentenceButton.onclick = async () => {
          sentenceButton.disabled = true;

          // display gears.gif while loading data
          image.src = './public/images/gears.gif';
          image.style.maxHeight = '10vh';
          image.style.paddingTop = '7.25vh';
          image.style.paddingBottom = '7.25vh';
          try {
            await axios
              .get(
                encodeURI(backendUrl + 'mirinae' + '/' + sentenceButton.value)
              )
              .then((res) => res.data)
              .then((data) => {
                // display the mirinae image
                image.src = 'data:image/png;base64,' + data.base64;
                image.style.paddingTop = '2.5vh';
                image.style.paddingBottom = '2.5vh';
                image.style.maxWidth = '80vw';
                image.style.maxHeight = '20vh';
              })
              .catch((err) => {
                // display error.png
                image.src = './public/images/error.png';
                console.log('Failed to load image from database.');
                console.log(err);
              });
          } catch (err) {
            console.log('Failed to send GET request.');
            console.log(err);
            throw new Error();
          }
          sentenceButton.disabled = false;
        };
        textDiv.appendChild(sentenceButton);
        koreanLyricsDiv.appendChild(textDiv);

        koreanLyricsDiv.appendChild(image);
      }
    } else {
      textDiv.appendChild(sentenceButton);
      koreanLyricsDiv.appendChild(textDiv);
    }
    var p = document.createElement('p');
    koreanLyricsDiv.appendChild(p);
  }
};

const submitSearch = () => {
  const userInput = searchbar.value;
  if (userInput) {
    resetElements();

    messageDiv.style.display = 'grid';
    songContentDiv.style.display = 'none';
    frontPageAreaDiv.style.display = 'none';
    topButtons.style.display = 'none';

    const headerHeight = 12.5;
    let root = document.documentElement;
    root.style.setProperty('--header-height', headerHeight + 'vh'); // collapse header
    root.style.setProperty('--header-flex-direction', 'row');
    header.style.borderBottomColor = '#48a9a6';
    // 87cbc8 is the lighter blue
    document.body.style.background = '#f6fbfb';

    loadingText.textContent = 'Searching';

    logo.style.height = 0.66 * headerHeight + 'vh';
    logo.style.display = 'block';
    logo.style.paddingLeft = '7.5vw';
    logo.src = './public/images/mirinae.png';
    logo.style.marginTop = '1vw';
    logo.style.width = '16.5vw';
    logo.style.height = '3.5vw';

    console.log('retrieving search results...');

    axios
      .get(backendUrl + 'search' + '/' + 'multiple', {
        params: { searchTerm: userInput },
      })
      .then((res) => res.data)
      .then(async (songs) => {
        // render the home screen images
        fetch('./public/templates/front-page-song.mustache')
          .then((res) => res.text())
          .then((template) => {
            for (let i = 0; i <= 7; i++) {
              if (i >= songs.length) {
                // hide all unused song elements
                const rendered = Mustache.render(template, {
                  number: i.toString(),
                  songTitle: '',
                  songArtist: '',
                  imageUrl: '',
                  style: 'display: none;',
                });
                document.getElementById('front-page-song-' + i).innerHTML =
                  rendered;
              } else {
                const song = songs[i];
                const rendered = Mustache.render(template, {
                  number: i.toString(),
                  songTitle:
                    song.title.length >= 25
                      ? song.title.substring(0, 22) + '...'
                      : song.title,
                  songArtist:
                    song.artist.length >= 29
                      ? song.artist.substring(0, 26) + '...'
                      : song.artist,
                  imageUrl: song.imageSrc,
                  style: '',
                });

                document.getElementById('front-page-song-' + i).innerHTML =
                  rendered;
              }
              frontPageAreaDiv.style.display = 'block'; // now show the results
              messageDiv.style.display = 'none';
            }
          })
          .then((res) => {
            const main = async (i) => {
              const selectedSongData = songs[i];

              const title = selectedSongData.title;
              const artistName = selectedSongData.artist;
              const koreanLyrics = selectedSongData.lyrics;
              const imageSrc = selectedSongData.imageSrc;

              loadingText.textContent = '';

              messageDiv.style.display = 'none';
              songContentDiv.style.display = 'block';
              frontPageAreaDiv.style.display = 'none';
              searchDiv.style.display = 'flex';
              topButtons.style.display = 'flex';

              console.log('displaying song content...');

              songTitle.textContent = title;
              artist.textContent = artistName;
              songImage.src = imageSrc;

              displayLinkedKoreanLyrics(koreanLyrics);

              // this code repeats down below. It is slightly different as it pulls existing text data.
              topLeftButton.src = './public/images/back.png';

              topLeftButton.onclick = async () => {
                messageDiv.style.display = 'none';
                songContentDiv.style.display = 'none';
                frontPageAreaDiv.style.display = 'block';
                searchDiv.style.display = 'flex';
                topButtons.style.display = 'none';

                topLeftButton.src = './public/images/transparent.png';

                const koreanLyricsDiv = document.getElementById(
                  'korean-lyrics-mirinae'
                );
                while (koreanLyricsDiv.firstChild) {
                  koreanLyricsDiv.removeChild(koreanLyricsDiv.lastChild);
                }
              };
            };

            for (let i = 0; i <= 7; i++) {
              const result = document.getElementById('result-' + i.toString());
              result.onclick = () => {
                console.log('collecting korean lyrics...');

                messageDiv.style.display = 'grid';
                songContentDiv.style.display = 'none';
                frontPageAreaDiv.style.display = 'none';
                searchDiv.style.display = 'none';
                topButtons.style.display = 'none';

                errorMsg.textContent = '';
                loadingText.textContent = 'Loading';

                main(i);
              };
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .then((res) => {
        loadingText.textContent = '';
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// also submit when enter is pressed
searchbar.onkeydown = (event) => {
  const keyCode = event
    ? event.which
      ? event.which
      : event.keyCode
    : event.keyCode;
  if (keyCode == 13) {
    event.preventDefault();
    submitSearch();
  }
};

// make the text for loading dynamic
setInterval(() => {
  const currentLoadingText = loadingText.textContent;

  if (currentLoadingText) {
    if (currentLoadingText.split('.').length - 1 < 3) {
      loadingText.textContent += '.';
    } else {
      loadingText.textContent = currentLoadingText.replace('...', '');
    }
  }
}, 350);
