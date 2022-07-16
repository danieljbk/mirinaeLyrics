'use strict';

let inko = new Inko(); // korean -> english characters and vice versa

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const backendUrl = 'https://kpoptranslator.herokuapp.com' + '/';
  // const backendUrl = 'http://localhost:8080' + '/';

  const translateButton = document.getElementById('translate-button');
  const searchbar = document.getElementById('searchbar');
  const submitSearchButton = document.getElementById('translate-button');
  const loading = document.getElementById('loading');
  const songTitle = document.getElementById('display-song-title');
  const artist = document.getElementById('display-artist-name');
  const koreanTitleText = document.getElementById('korean-title');
  const koreanLyricsText = document.getElementById('korean-lyrics');
  const englishTitleText = document.getElementById('english-title');
  const englishLyricsText = document.getElementById('english-lyrics');
  const songImage = document.getElementById('display-song-image');
  const errorMsg = document.getElementById('error-message');
  const addTranslationButton = document.getElementById('add-translation');
  const translationTitle = document.getElementById('translated-title');
  const translationBody = document.getElementById('translated-lyrics');
  const koreanVersion = document.getElementById('korean-version');
  const englishVersion = document.getElementById('english-version');
  const originalTitle = document.getElementById('original-title');
  const originalLyrics = document.getElementById('original-lyrics');
  const originalArtistName = document.getElementById('original-artist-name');
  const originalSongInfo = document.getElementById('original-song-info');
  const translatedSongInfo = document.getElementById('translated-song-info');
  const translationSubmitButton = document.getElementById('submit-translation');
  const editSongInfoButton = document.getElementById('edit-song-info');
  const spotifyPlayer = document.getElementById('embedded-spotify-player');

  const songContentDiv = document.getElementById('display-song-content');
  const messageDiv = document.getElementById('display-message-text');
  const translationAreaDiv = document.getElementById('translation-area');
  messageDiv.style.display = 'none';
  songContentDiv.style.display = 'none';
  translationAreaDiv.style.display = 'none';

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
    translationTitle.style.display = 'none';
    translationBody.style.display = 'none';
    originalTitle.textContent = '';
    originalLyrics.textContent = '';
    originalArtistName.textContent = '';
    translationSubmitButton.src = '';
    editSongInfoButton.src = '';
    spotifyPlayer.innerHTML = '';
  };

  const submitSearch = () => {
    const userInput = searchbar.value;
    if (userInput) {
      console.log('collecting korean lyrics...');

      resetElements();

      messageDiv.style.display = 'grid';
      songContentDiv.style.display = 'none';
      translationAreaDiv.style.display = 'none';
      loading.textContent = 'Loading...';

      submitSearchButton.disabled = true;

      axios
        .get(backendUrl + 'search' + '/' + userInput + ' ' + 'korean')
        .then((res) => res.data)
        .then(async (koreanSongData) => {
          const title = koreanSongData.title;
          const artistName = koreanSongData.artist;
          const koreanLyrics = koreanSongData.lyrics;
          const imageSrc = koreanSongData.imageSrc;

          // verify that there is a korean word in the lyrics
          let koreanLyricsContainKorean = false;

          // turn newlines into space and get rid of special characters (turns it into an array)
          for (let word of koreanLyrics
            .replaceAll('\n', ' ')
            .match(/[\p{L}-]+/gu)) {
            if (word && word.toLowerCase() === inko.en2ko(word.toLowerCase())) {
              koreanLyricsContainKorean = true;
              break;
            }
          }

          if (koreanLyricsContainKorean) {
            console.log('collecting english lyrics...');

            let englishTitle;
            let englishLyrics;

            // check if user-generated song data is in database
            try {
              await axios
                .get(backendUrl + 'songs' + '/' + title)
                .then((res) => res.data)
                .then(async (existingSong) => {
                  englishTitle = existingSong.englishTitle;
                  englishLyrics = existingSong.englishLyrics;
                });
            } catch (err) {
              console.log(title + ' is not in the database.');
            }

            // if not, see if Genius has the english lyrics
            if (!englishLyrics) {
              try {
                await axios
                  .get(
                    backendUrl + 'search' + '/' + userInput + ' ' + 'english'
                  )
                  .then((res) => res.data)
                  .then(async (englishSongData) => {
                    englishLyrics = await englishSongData.lyrics;
                  });
              } catch (err) {
                console.log('No results found for ' + title + '.');
              }
            }

            // verify that there are no korean words in the lyrics
            let englishLyricsDoesNotContainKorean = true;
            if (englishLyrics) {
              // turn newlines into space and get rid of special characters (turns it into an array)
              for (let word of englishLyrics
                .replaceAll('\n', ' ')
                .match(/[\p{L}-]+/gu)) {
                if (
                  word &&
                  word.toLowerCase() === inko.en2ko(word.toLowerCase())
                ) {
                  englishLyricsDoesNotContainKorean = false;
                  break;
                }
              }
            }

            if (englishLyrics && englishLyricsDoesNotContainKorean) {
              messageDiv.style.display = 'none';
              songContentDiv.style.display = 'block';
              translationAreaDiv.style.display = 'none';

              console.log('embedding Spotify player...');

              // set up embedded Spotify player
              spotifyPlayer.style.display = 'block';
              songTitle.style.marginTop = '60px';
              songImage.src = imageSrc;
              songImage.onload = () => {
                spotifyPlayer.style.width = songImage.width * 0.8 + 'px';
              };
              await axios
                .get(backendUrl + 'spotify' + '/' + 'html', {
                  params: {
                    koreanTitle: title,
                    artistName,
                  },
                })
                .then((res) => res.data)
                .then((data) => {
                  spotifyPlayer.innerHTML = data.html;
                })
                .catch((err) => {
                  // couldn't find the song on Spotify.
                  spotifyPlayer.style.display = 'none';
                  songTitle.style.marginTop = '0px';
                  console.log(err);
                });

              console.log('displaying song content...');

              songTitle.textContent = title;
              artist.textContent = artistName;
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

              // this code repeats down below for translationSubmitButton. It is slightly different as it pulls existing text data.
              editSongInfoButton.src = 'public/images/edit.png';
              editSongInfoButton.onclick = () => {
                console.log('switching to edit mode...');

                resetElements();

                searchbar.setAttribute('type', 'hidden');
                submitSearchButton.style.visibility = 'hidden';

                messageDiv.style.display = 'none';
                songContentDiv.style.display = 'none';
                translationAreaDiv.style.display = 'grid';

                originalTitle.textContent = title;
                originalArtistName.textContent = artistName;
                translationTitle.style.display = 'block';
                translationBody.style.display = 'block';
                translationBody.rows = koreanLyrics.split('\n').length - 1;

                translationTitle.value = englishTitle;
                translationBody.value = englishLyrics;

                originalLyrics.setAttribute('style', 'white-space: pre;');
                originalLyrics.textContent = koreanLyrics.replaceAll(
                  '\n',
                  '\r\n'
                );

                if (
                  originalSongInfo.offsetWidth > translatedSongInfo.offsetWidth
                ) {
                  translatedSongInfo.style.width =
                    originalSongInfo.offsetWidth + 'px';
                } else {
                  originalSongInfo.style.width =
                    translatedSongInfo.offsetWidth + 'px';
                }

                editSongInfoButton.src = '';
                translationSubmitButton.src = 'public/images/writing.png';
                translationSubmitButton.onclick = async () => {
                  console.log('submitting translation...');

                  try {
                    await axios.put(backendUrl + 'songs' + '/' + title, {
                      englishTitle: translationTitle.value,
                      englishLyrics: translationBody.value,
                    });

                    resetElements();

                    searchbar.value = userInput;
                    searchbar.setAttribute('type', 'text');
                    submitSearchButton.style.visibility = 'visible';

                    submitSearch();
                  } catch (err) {
                    console.log('Failed to save translation.');
                  }
                };
              };
            } else {
              console.log('missing english translation...');

              addTranslationButton.src = 'public/images/write.png';

              messageDiv.style.display = 'grid';
              songContentDiv.style.display = 'none';
              translationAreaDiv.style.display = 'none';

              errorMsg.setAttribute('style', 'white-space: pre;');
              errorMsg.textContent =
                'Nobody has translated' +
                '\r\n' +
                '"' +
                title +
                '"' +
                '\r\n' +
                'by' +
                ' ' +
                artistName +
                '.' +
                '\r\n\r\n' +
                'Do it yourself?';

              addTranslationButton.onclick = () => {
                console.log('switching to edit mode...');

                resetElements();

                messageDiv.style.display = 'none';
                songContentDiv.style.display = 'none';
                translationAreaDiv.style.display = 'grid';

                searchbar.setAttribute('type', 'hidden');
                submitSearchButton.style.visibility = 'hidden';

                originalTitle.textContent = title;
                originalArtistName.textContent = artistName;
                translationTitle.style.display = 'block';
                translationBody.style.display = 'block';
                translationBody.rows = koreanLyrics.split('\n').length - 1;

                originalLyrics.setAttribute('style', 'white-space: pre;');
                originalLyrics.textContent = koreanLyrics.replaceAll(
                  '\n',
                  '\r\n'
                );

                if (
                  originalSongInfo.offsetWidth > translatedSongInfo.offsetWidth
                ) {
                  translatedSongInfo.style.width =
                    originalSongInfo.offsetWidth + 'px';
                } else {
                  originalSongInfo.style.width =
                    translatedSongInfo.offsetWidth + 'px';
                }

                translationSubmitButton.src = 'public/images/writing.png';
                translationSubmitButton.onclick = async () => {
                  console.log('submitting translation...');
                  try {
                    await axios.put(backendUrl + 'songs' + '/' + title, {
                      englishTitle: translationTitle.value,
                      englishLyrics: translationBody.value,
                    });

                    resetElements();

                    searchbar.value = userInput;
                    searchbar.setAttribute('type', 'text');
                    submitSearchButton.style.visibility = 'visible';

                    submitSearch();
                  } catch (err) {
                    console.log('Failed to save translation.');
                  }
                };
              };
            }
          } else {
            throw new Error();
          }
        })
        .catch((err) => {
          console.log('missing korean lyrics...');
          messageDiv.style.display = 'grid';
          songContentDiv.style.display = 'none';
          translationAreaDiv.style.display = 'none';

          const errorMsg = document.getElementById('error-message');
          errorMsg.setAttribute('style', 'white-space: pre;');
          errorMsg.textContent =
            "Sorry, we couldn't find" + '\r\n' + '"' + userInput + '.' + '"';
        })
        .then((res) => {
          loading.textContent = '';
          submitSearchButton.disabled = false;
        });
    }
  };

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
};
