(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = $('[data-menu-button]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = $('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]');
    var prev = $('[data-hero-prev]');
    var next = $('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = $all('[data-filter-panel]');

    panels.forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var list = $('[data-movie-list]', scope) || $('[data-movie-list]');
      var cards = list ? $all('[data-movie-card]', list) : $all('[data-movie-card]');
      var search = $('[data-movie-search]', panel);
      var category = $('[data-filter-category]', panel);
      var year = $('[data-filter-year]', panel);
      var count = $('[data-visible-count]', panel);

      function getCardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].map(normalize).join(' ');
      }

      function apply() {
        var keyword = normalize(search && search.value);
        var selectedCategory = normalize(category && category.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = getCardText(card);
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;
          var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')).indexOf(selectedYear) !== -1;
          var shouldShow = matchesKeyword && matchesCategory && matchesYear;

          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }
      }

      [search, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupPlayer() {
    var video = $('[data-player]');

    if (!video) {
      return;
    }

    var playButton = $('[data-play-button]');
    var sourceButtons = $all('[data-source-button]');
    var hlsInstance = null;

    function destroyHls() {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }

      hlsInstance = null;
    }

    function setButtonHidden(hidden) {
      if (playButton) {
        playButton.classList.toggle('is-hidden', hidden);
      }
    }

    function attachSource(source) {
      if (!source) {
        return;
      }

      destroyHls();
      video.pause();
      video.removeAttribute('src');
      video.load();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function onMetadata() {
          video.removeEventListener('loadedmetadata', onMetadata);
          video.play().catch(function () {});
        });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }

      video.setAttribute('data-ready', 'true');
      setButtonHidden(true);
    }

    function playCurrent() {
      var source = video.getAttribute('data-src');

      if (video.getAttribute('data-ready') === 'true') {
        setButtonHidden(true);
        video.play().catch(function () {});
        return;
      }

      attachSource(source);
    }

    if (playButton) {
      playButton.addEventListener('click', playCurrent);
    }

    video.addEventListener('play', function () {
      setButtonHidden(true);
    });

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        video.setAttribute('data-src', button.getAttribute('data-src'));
        attachSource(button.getAttribute('data-src'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayer();
  });
})();
