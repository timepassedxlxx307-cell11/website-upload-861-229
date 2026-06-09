(function () {
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-nav]');
        if (!button || !nav) return;
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) return;
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) return;
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) window.clearInterval(timer);
        }

        if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
        if (next) next.addEventListener('click', function () { show(index + 1); start(); });
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () { show(i); start(); });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        qsa('[data-filter-form]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-search]');
            var genre = panel.querySelector('[data-filter-genre]');
            var year = panel.querySelector('[data-filter-year]');
            var sort = panel.querySelector('[data-filter-sort]');
            var targetSelector = panel.getAttribute('data-filter-target');
            var target = document.querySelector(targetSelector);
            var empty = document.querySelector('[data-empty-state]');
            if (!target) return;
            var cards = qsa('[data-card="movie"]', target);

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var genreValue = normalize(genre && genre.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var search = normalize(card.getAttribute('data-search'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;
                    if (keyword && search.indexOf(keyword) === -1) matched = false;
                    if (genreValue && cardGenre.indexOf(genreValue) === -1) matched = false;
                    if (yearValue && cardYear.indexOf(yearValue) === -1) matched = false;
                    card.style.display = matched ? '' : 'none';
                    if (matched) visible += 1;
                });
                if (empty) empty.classList.toggle('is-visible', visible === 0);
            }

            function resort() {
                var mode = sort ? sort.value : 'default';
                var sorted = cards.slice();
                if (mode === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-year').match(/\d{4}/) || 0) - Number(a.getAttribute('data-year').match(/\d{4}/) || 0);
                    });
                }
                if (mode === 'year-asc') {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute('data-year').match(/\d{4}/) || 0) - Number(b.getAttribute('data-year').match(/\d{4}/) || 0);
                    });
                }
                if (mode === 'title') {
                    sorted.sort(function (a, b) {
                        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                    });
                }
                sorted.forEach(function (card) { target.appendChild(card); });
                apply();
            }

            [input, genre, year].forEach(function (el) {
                if (el) el.addEventListener('input', apply);
                if (el) el.addEventListener('change', apply);
            });
            if (sort) sort.addEventListener('change', resort);
            apply();
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector('[data-video-player]');
        var overlay = document.querySelector('[data-player-button]');
        var shell = document.querySelector('[data-video-shell]');
        if (!video || !source) return;
        var ready = false;
        var hlsInstance = null;

        function attach() {
            if (ready) return;
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (overlay) overlay.classList.add('is-hidden');
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) overlay.addEventListener('click', play);
        if (shell) shell.addEventListener('click', function (event) {
            if (event.target === overlay || overlay && overlay.contains(event.target)) return;
            if (!ready) play();
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) hlsInstance.destroy();
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
