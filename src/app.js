'use strict';

// const backendUrl = 'https://kpoptranslator.herokuapp.com' + '/';
const backendUrl = 'http://localhost:8080' + '/';

const submitSearch = () => {
  const userInput = document.getElementById('textarea-song').value;
  if (userInput) {
    const songTitle = document.getElementById('display-song-title');
    songTitle.textContent = 'Loading...';

    const artist = document.getElementById('display-artist-name');
    artist.textContent = '';

    const koreanTitle = document.getElementById('korean-title');
    const koreanLyrics = document.getElementById('korean-lyrics');
    const englishTitle = document.getElementById('english-title');
    const englishLyrics = document.getElementById('english-lyrics');

    koreanTitle.textContent = '';
    koreanLyrics.textContent = '';
    englishTitle.textContent = '';
    englishLyrics.textContent = '';

    fetch(backendUrl + userInput + ' ' + 'korean')
      .then((res) => res.json())
      .then((data_1) => {
        const artistName = data_1.artist;

        const korean = data_1.lyrics;
        if (korean) {
          fetch(backendUrl + userInput + ' ' + 'english')
            .then((res) => res.json())
            .then((data_2) => {
              const english = data_2.lyrics;
              if (english) {
                const songTitle = document.getElementById('display-song-title');
                songTitle.textContent = userInput;

                const artist = document.getElementById('display-artist-name');
                artist.textContent = 'By' + ' ' + artistName;

                const koreanTitle = document.getElementById('korean-title');
                const koreanLyrics = document.getElementById('korean-lyrics');
                const englishTitle = document.getElementById('english-title');
                const englishLyrics = document.getElementById('english-lyrics');

                koreanTitle.textContent = 'Korean';

                koreanLyrics.setAttribute('style', 'white-space: pre;');
                koreanLyrics.textContent = korean.replaceAll('\n', '\r\n');

                englishTitle.textContent = 'English';

                englishLyrics.setAttribute('style', 'white-space: pre;');
                englishLyrics.textContent = english.replaceAll('\n', '\r\n');
              }
            });
        } else {
          const songTitle = document.getElementById('display-song-title');
          songTitle.textContent = 'Could not find the lyrics for the song.';
        }
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
