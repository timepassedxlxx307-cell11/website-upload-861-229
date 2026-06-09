(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function initializePlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-trigger]');
    var source = player.getAttribute('data-video-url');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1200);
        });
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      prepare().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);

  var searchForm = document.querySelector('[data-search-form]');
  var searchResults = document.querySelector('[data-search-results]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (searchForm && searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var queryInput = searchForm.querySelector('input[name="q"]');
    var categorySelect = searchForm.querySelector('select[name="category"]');

    if (queryInput) {
      queryInput.value = params.get('q') || '';
    }

    if (categorySelect) {
      categorySelect.value = params.get('category') || '';
    }

    function renderResults() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var results = window.SEARCH_INDEX.filter(function (item) {
        var matchesCategory = !category || item.category === category;
        var haystack = [item.title, item.category, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        return matchesCategory && matchesQuery;
      }).slice(0, 120);

      searchResults.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-wrap" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="poster-glow"></span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
          '    <p class="movie-meta">' + escapeHtml([item.year, item.region, item.type].filter(Boolean).join(' · ')) + '</p>',
          '    <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="movie-tags">',
          '      <span>' + escapeHtml(item.category) + '</span>',
          '      <span>' + escapeHtml(item.genre) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (emptyState) {
        emptyState.hidden = results.length > 0;
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextParams = new URLSearchParams();
      if (queryInput && queryInput.value.trim()) {
        nextParams.set('q', queryInput.value.trim());
      }
      if (categorySelect && categorySelect.value) {
        nextParams.set('category', categorySelect.value);
      }
      var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
      window.history.replaceState(null, '', nextUrl);
      renderResults();
    });

    if (queryInput) {
      queryInput.addEventListener('input', renderResults);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', renderResults);
    }

    renderResults();
  }
})();
