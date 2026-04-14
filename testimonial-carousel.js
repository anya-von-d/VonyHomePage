/* ─── Mobile Testimonials Carousel ─── */
(function () {
  var grid = document.querySelector('.testimonials-grid');
  var carousel = document.getElementById('testimonialCarousel');
  var pillsContainer = document.getElementById('carouselPills');
  if (!grid || !carousel || !pillsContainer) return;

  // Flatten all cards from grid columns into carousel
  var cards = grid.querySelectorAll('.testimonial-card');
  cards.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.classList.add('carousel-card');
    carousel.appendChild(clone);
  });

  // Create pill indicators
  cards.forEach(function (_, i) {
    var pill = document.createElement('span');
    pill.className = 'pill' + (i === 0 ? ' active' : '');
    pill.dataset.index = i;
    pillsContainer.appendChild(pill);
  });

  var pills = pillsContainer.querySelectorAll('.pill');
  var currentIndex = 0;
  var autoTimer = null;
  var touchTimeout = null;

  function scrollToCard(index) {
    var carouselCards = carousel.querySelectorAll('.carousel-card');
    if (!carouselCards[index]) return;
    var card = carouselCards[index];
    var scrollLeft = card.offsetLeft - (carousel.offsetWidth - card.offsetWidth) / 2;
    carousel.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    updatePills(index);
    currentIndex = index;
  }

  function updatePills(index) {
    pills.forEach(function (p, i) {
      p.classList.toggle('active', i === index);
    });
  }

  // Pill click
  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var idx = parseInt(pill.dataset.index, 10);
      scrollToCard(idx);
      pauseAutoRotate();
    });
  });

  // Detect scroll position to update pills
  var scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var carouselCards = carousel.querySelectorAll('.carousel-card');
        var idx = Array.prototype.indexOf.call(carouselCards, entry.target);
        if (idx >= 0) {
          currentIndex = idx;
          updatePills(idx);
        }
      }
    });
  }, { root: carousel, threshold: 0.6 });

  carousel.querySelectorAll('.carousel-card').forEach(function (card) {
    scrollObserver.observe(card);
  });

  // Auto-rotate
  function startAutoRotate() {
    stopAutoRotate();
    autoTimer = setInterval(function () {
      var next = (currentIndex + 1) % cards.length;
      scrollToCard(next);
    }, 4000);
  }

  function stopAutoRotate() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function pauseAutoRotate() {
    stopAutoRotate();
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(startAutoRotate, 6000);
  }

  // Pause on touch
  carousel.addEventListener('touchstart', pauseAutoRotate, { passive: true });
  carousel.addEventListener('scroll', function () {
    pauseAutoRotate();
  }, { passive: true });

  // Only start auto-rotate if mobile (carousel is visible)
  function checkAndStart() {
    if (window.getComputedStyle(carousel).display !== 'none') {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
  }

  // Start on load and resize
  checkAndStart();
  window.addEventListener('resize', checkAndStart);
})();
