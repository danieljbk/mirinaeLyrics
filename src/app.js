'use strict';

// const backendUrl = 'https://kpoptranslator.herokuapp.com' + '/';
const backendUrl = 'http://localhost:8080' + '/';

let searchbar = document.getElementById('searchbar');
let loading = document.getElementById('loading');
let songTitle = document.getElementById('display-song-title');
let artist = document.getElementById('display-artist-name');
let koreanTitleText = document.getElementById('korean-title');
let koreanLyricsText = document.getElementById('korean-lyrics');
let englishTitleText = document.getElementById('english-title');
let englishLyricsText = document.getElementById('english-lyrics');
let songImage = document.getElementById('display-song-image');
let errorMsg = document.getElementById('error-message');
let addTranslationButton = document.getElementById('add-translation');
let translationTitle = document.getElementById('translated-title');
let translationBody = document.getElementById('translated-lyrics');
const koreanVersion = document.getElementById('korean-version');
const englishVersion = document.getElementById('english-version');
let originalTitle = document.getElementById('original-title');
let originalLyrics = document.getElementById('original-lyrics');
let originalArtist = document.getElementById('original-artist-name');
let originalSongInfo = document.getElementById('original-song-info');
let translatedSongInfo = document.getElementById('translated-song-info');
let translationSubmitButton = document.getElementById('submit-translation');

const resetElements = () => {
  loading.textContent = '';
  songTitle.textContent = '';
  artist.textContent = '';
  koreanTitleText.textContent = '';
  koreanLyricsText.textContent = '';
  englishTitleText.textContent = '';
  englishLyricsText.textContent = '';
  songImage.src = '';
  errorMsg.textContent = '';
  addTranslationButton.src = '';
  translationBody.style.display = 'none';
};

const submitSearch = () => {
  const userInput = searchbar.value;
  if (userInput) {
    resetElements();
    loading.textContent = 'Loading...';

    fetch(backendUrl + userInput + ' ' + 'korean')
      .then((res) => res.json())
      .then(async (koreanSongData) => {
        const title = koreanSongData.title;
        const artistName = koreanSongData.artist;
        const koreanLyrics = await koreanSongData.lyrics;
        const imageSrc = koreanSongData.imageSrc;

        if (koreanLyrics) {
          fetch(backendUrl + userInput + ' ' + 'english')
            .then((res) => res.json())
            .then(async (englishSongData) => {
              const englishLyrics = await englishSongData.lyrics;

              if (englishLyrics) {
                songImage.src = imageSrc;
                songTitle.textContent = title;
                artist.textContent = ' - ' + artistName;
                koreanTitleText.textContent = 'Korean';
                koreanLyricsText.setAttribute('style', 'white-space: pre;');
                koreanLyricsText.textContent = koreanLyrics.replaceAll(
                  '\n',
                  '\r\n'
                );
                englishTitleText.textContent = 'English';
                englishLyricsText.setAttribute('style', 'white-space: pre;');
                englishLyricsText.textContent = englishLyrics.replaceAll(
                  '\n',
                  '\r\n'
                );
                if (koreanVersion.offsetWidth > englishVersion.offsetWidth) {
                  englishVersion.style.width = koreanVersion.offsetWidth + 'px';
                } else {
                  koreanVersion.style.width = englishVersion.offsetWidth + 'px';
                }
              } else {
                addTranslationButton.src = 'images/write.png';

                errorMsg.setAttribute('style', 'white-space: pre;');
                errorMsg.textContent =
                  'No English Lyrics Found.\r\n\r\nWould you like to add your own translation?';

                addTranslationButton.onclick = () => {
                  resetElements();
                  originalTitle.textContent = title;
                  originalArtist.textContent = ' - ' + artistName;
                  translationTitle.style.display = 'block';
                  translationBody.style.display = 'block';
                  translationBody.rows = koreanLyrics.split('\n').length - 1;

                  originalLyrics.setAttribute('style', 'white-space: pre;');
                  originalLyrics.textContent = koreanLyrics.replaceAll(
                    '\n',
                    '\r\n'
                  );

                  if (
                    originalSongInfo.offsetWidth >
                    translatedSongInfo.offsetWidth
                  ) {
                    translatedSongInfo.style.width =
                      originalSongInfo.offsetWidth + 'px';
                  } else {
                    originalSongInfo.style.width =
                      translatedSongInfo.offsetWidth + 'px';
                  }

                  translationSubmitButton.src = 'images/writing.png';
                };
              }
            });
        } else {
          const errorMsg = document.getElementById('error-message');
          errorMsg.textContent = 'No Korean Lyrics Found.';
        }
      })
      .then((res) => {
        loading.textContent = '';
      });
  }
};

const translateButton = document.getElementById('translate-button');
translateButton.onclick = () => {
  submitSearch();
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

// also submit when enter is pressed
translationBody.onkeydown = (event) => {
  const keyCode = event
    ? event.which
      ? event.which
      : event.keyCode
    : event.keyCode;
  if (keyCode == 13) {
    translationBody.rows += 1;
  }
};
