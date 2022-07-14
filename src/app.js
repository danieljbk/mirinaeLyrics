'use strict';

const backendUrl = 'https://kpoptranslator.herokuapp.com' + '/';
// const backendUrl = 'http://localhost:8080' + '/';

const submitSearch = () => {
  const userInput = document.getElementById('textarea-song').value;
  if (userInput) {
    const songTitle = document.getElementById('display-song-title');
    songTitle.textContent = 'Loading...';

    const artist = document.getElementById('display-artist-name');
    artist.textContent = '';

    const koreanTitleText = document.getElementById('korean-title');
    const koreanLyricsText = document.getElementById('korean-lyrics');
    const englishTitleText = document.getElementById('english-title');
    const englishLyricsText = document.getElementById('english-lyrics');

    koreanTitleText.textContent = '';
    koreanLyricsText.textContent = '';
    englishTitleText.textContent = '';
    englishLyricsText.textContent = '';

    const songImage = document.getElementById('display-song-image');
    songImage.src = '';
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
                const songImage = document.getElementById('display-song-image');
                songImage.src = imageSrc;

                const songTitle = document.getElementById('display-song-title');
                songTitle.textContent = title;

                const artist = document.getElementById('display-artist-name');
                artist.textContent = 'By' + ' ' + artistName;

                const koreanTitleText = document.getElementById('korean-title');
                const koreanLyricsText =
                  document.getElementById('korean-lyrics');
                const englishTitleText =
                  document.getElementById('english-title');
                const englishLyricsText =
                  document.getElementById('english-lyrics');

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
              } else {
                throw new Error('Unable to fetch English lyrics.');
              }
            })
            .catch((err) => {
              const songTitle = document.getElementById('display-song-title');
              songTitle.textContent = err;
            });
        } else {
          throw new Error('Unable to fetch Korean lyrics.');
        }
      })
      .catch((err) => {
        const songTitle = document.getElementById('display-song-title');
        songTitle.textContent = err;
      });
  }
};

const translateButton = document.getElementById('translate-button');
translateButton.onclick = () => {
  submitSearch();
};

// also submit when enter is pressed
document.getElementById('textarea-song').onkeydown = (event) => {
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
