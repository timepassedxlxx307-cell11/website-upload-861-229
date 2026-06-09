(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function run() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        run();
      });
    });

    show(0);
    run();
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterInput = document.querySelector('[data-filter-search]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-filter-empty]');

  if (filterInput && filterCards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial) {
      filterInput.value = initial;
    }

    function applyFilters() {
      var query = normalize(filterInput.value);
      var region = normalize(filterRegion && filterRegion.value);
      var type = normalize(filterType && filterType.value);
      var year = normalize(filterYear && filterYear.value);
      var category = normalize(filterCategory && filterCategory.value);
      var visible = 0;

      filterCards.forEach(function (card) {
        var blob = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesQuery = !query || blob.indexOf(query) !== -1;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesCategory = !category || blob.indexOf(category) !== -1;
        var showCard = matchesQuery && matchesRegion && matchesType && matchesYear && matchesCategory;

        card.classList.toggle('is-hidden', !showCard);

        if (showCard) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [filterInput, filterRegion, filterType, filterYear, filterCategory].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    if (!video || !overlay || !stream) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });

    shell.addEventListener('click', function (event) {
      if (event.target === overlay || overlay.contains(event.target)) {
        return;
      }

      if (!attached || video.paused) {
        play();
      }
    });

    shell.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
