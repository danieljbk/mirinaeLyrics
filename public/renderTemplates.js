const renderTemplates = () => {
  fetch('./public/templates/front-page-song.mustache')
    .then((response) => response.text())
    .then((template) => {
      for (let i = 0; i <= 7; i++) {
        const rendered = Mustache.render(template, {
          number: i.toString(),
          songTitle: '',
          songArtist: '',
          imageUrl: '',
          style: 'display: none;',
        });
        document.getElementById('front-page-song-' + i).innerHTML = rendered;
      }
    });
};
