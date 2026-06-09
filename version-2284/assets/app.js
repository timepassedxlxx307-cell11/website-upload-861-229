(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 6500);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filter = document.querySelector('.movie-filter');
  if (filter) {
    var keyword = filter.querySelector('.filter-keyword');
    var region = filter.querySelector('.filter-region');
    var type = filter.querySelector('.filter-type');
    var year = filter.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && keyword) {
      keyword.value = q;
    }

    function applyFilter() {
      var k = normalize(keyword && keyword.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;

        if (k && text.indexOf(k) === -1) {
          ok = false;
        }
        if (r && cardRegion !== r) {
          ok = false;
        }
        if (t && cardType !== t) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [keyword, region, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilter);
        field.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();

function initPlayer(sourceUrl) {
  var frame = document.querySelector('.watch-frame');
  var video = document.querySelector('.watch-video');
  var button = document.querySelector('.play-control');
  var hlsInstance = null;
  var loaded = false;

  if (!frame || !video || !button || !sourceUrl) {
    return;
  }

  function attachStream() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
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
      video.src = sourceUrl;
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    attachStream();
    button.classList.add('is-playing');
    video.play().catch(function () {});
  }

  button.addEventListener('click', start);
  frame.addEventListener('click', function (event) {
    if (event.target === video && !video.paused) {
      return;
    }
    start();
  });
  video.addEventListener('play', function () {
    button.classList.add('is-playing');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
