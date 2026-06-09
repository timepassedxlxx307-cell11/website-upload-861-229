(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initializeMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initializeHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });
    activate(0);
    start();
  }

  function initializeFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
      var emptyState = scope.querySelector('[data-empty-state]');
      var activeFilter = '全部';
      function valueFor(card) {
        return [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
      }
      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = valueFor(card);
          var queryMatched = !query || text.indexOf(query) !== -1;
          var chipMatched = activeFilter === '全部' || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = queryMatched && chipMatched;
          card.classList.toggle('hidden-card', !show);
          if (show) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle('visible', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', applyFilter);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-button') || '全部';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          applyFilter();
        });
      });
      if (buttons.length > 0) {
        buttons[0].classList.add('active');
      }
      applyFilter();
    });
  }

  function initializeMoviePlayer() {
    var root = document.querySelector('[data-player-root]');
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    var sourceElement = video.querySelector('source');
    var streamUrl = sourceElement ? sourceElement.getAttribute('src') : video.getAttribute('src');
    if (!streamUrl) {
      return;
    }
    var hlsInstance = null;
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
    function startPlayback() {
      if (overlay) {
        overlay.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
  }

  ready(function () {
    initializeMobileNavigation();
    initializeHero();
    initializeFilters();
    initializeMoviePlayer();
  });
}());
