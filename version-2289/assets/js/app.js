(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupInlineSearch() {
    var input = document.querySelector("[data-inline-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    if (!input && buttons.length === 0) {
      return;
    }
    var activeTerm = "all";

    if (input && input.hasAttribute("data-read-query")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedTerm = activeTerm === "all" || text.indexOf(activeTerm) !== -1;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedTerm));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeTerm = normalize(button.getAttribute("data-filter-button"));
        buttons.forEach(function (other) {
          other.classList.toggle("is-active", other === button);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var mounted = false;
      var hlsInstance = null;

      function mount() {
        if (!video) {
          return;
        }
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        if (!mounted) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          mounted = true;
        }
        box.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          mount();
        });
      }
      box.addEventListener("click", function (event) {
        if (event.target === video && mounted) {
          return;
        }
        if (event.target && event.target.closest && event.target.closest("video")) {
          return;
        }
        mount();
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupInlineSearch();
    setupPlayers();
  });
})();
