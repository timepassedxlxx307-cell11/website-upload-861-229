(function () {
  const navButton = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const searchInput = panel.querySelector('[data-search-input]');
    const regionFilter = panel.querySelector('[data-region-filter]');
    const yearFilter = panel.querySelector('[data-year-filter]');
    const categoryFilter = panel.querySelector('[data-category-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);
    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }
    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }
    function applyFilters() {
      const keyword = normalize(searchInput && searchInput.value);
      const region = normalize(regionFilter && regionFilter.value);
      const year = normalize(yearFilter && yearFilter.value);
      const category = normalize(categoryFilter && categoryFilter.value);
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.tags,
          card.dataset.category,
          card.textContent
        ].join(' '));
        const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchedRegion = !region || normalize(card.dataset.region) === region;
        const matchedYear = !year || normalize(card.dataset.year) === year;
        const matchedCategory = !category || normalize(card.dataset.category) === category;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedRegion && matchedYear && matchedCategory));
      });
    }
    [searchInput, regionFilter, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }
})();
