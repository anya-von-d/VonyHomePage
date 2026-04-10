/**
 * Dashboard Scatter-to-Grid Effect
 *
 * Cards start as glassmorphism blanks at the bottom-left and
 * bottom-right corners of the hero. On scroll they settle into
 * the dashboard grid and reveal their content.
 */
(function () {
  'use strict';

  var box = document.querySelector('.pdb-box');
  if (!box) return;

  var items = box.querySelectorAll('.pdb-card, .pdb-inbox');
  if (!items.length) return;

  /* Unique rotation per card */
  var rotations = [8, -12, 14, -5, -16, 7, 11, -9, 3, -14, 6];

  /* Scatter cards to bottom-left and bottom-right corners */
  items.forEach(function (el, i) {
    el.style.setProperty('--scatter-rotate', rotations[i % rotations.length] + 'deg');
    el.style.setProperty('--scatter-delay', (i * 0.08) + 's');

    /* Alternate left (-) and right (+) with some variation */
    var side = (i % 2 === 0) ? -1 : 1;
    var xOffset = side * (280 + (i % 3) * 60);
    el.style.setProperty('--scatter-x', xOffset + 'px');
  });

  var settled = false;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var shouldSettle = entry.isIntersecting && entry.intersectionRatio >= 0.35;

        if (shouldSettle && !settled) {
          box.classList.add('cards-settled');
          settled = true;
        } else if (!entry.isIntersecting && settled) {
          box.classList.remove('cards-settled');
          settled = false;
        }
      });
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.35, 0.5] }
  );

  observer.observe(box);
})();
