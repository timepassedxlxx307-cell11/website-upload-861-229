(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var active = 0;
      var showSlide = function (next) {
        if (!slides.length) {
          return;
        }
        active = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          slide.classList.toggle('is-active', index === active);
        });
        dots.forEach(function (dot, index) {
          dot.classList.toggle('is-active', index === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
      var section = input.closest('.section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var noResult = section.querySelector('[data-no-result]');
      var currentFilter = 'all';
      var filterButtons = Array.prototype.slice.call(section.querySelectorAll('[data-filter]'));
      var apply = function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var type = (card.getAttribute('data-type') || '').toLowerCase();
          var year = (card.getAttribute('data-year') || '').toLowerCase();
          var region = (card.getAttribute('data-region') || '').toLowerCase();
          var genre = (card.getAttribute('data-genre') || '').toLowerCase();
          var matchesKeyword = !keyword || search.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
          var filter = currentFilter.toLowerCase();
          var matchesFilter = filter === 'all' || type.indexOf(filter) !== -1 || year.indexOf(filter) !== -1 || region.indexOf(filter) !== -1 || genre.indexOf(filter) !== -1 || search.indexOf(filter) !== -1;
          var shown = matchesKeyword && matchesFilter;
          card.classList.toggle('is-hidden', !shown);
          if (shown) {
            visible += 1;
          }
        });
        if (noResult) {
          noResult.hidden = visible !== 0;
        }
      };
      input.addEventListener('input', apply);
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentFilter = button.getAttribute('data-filter') || 'all';
          filterButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var load = function () {
        if (!video || !stream || video.dataset.loaded === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        video.dataset.loaded = 'true';
        player.classList.add('is-ready');
      };
      var play = function () {
        load();
        if (!video) {
          return;
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      };
      if (cover) {
        cover.addEventListener('click', function () {
          player.classList.add('is-playing');
          play();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          player.classList.remove('is-playing');
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
