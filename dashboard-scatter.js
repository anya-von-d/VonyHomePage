/**
 * Dashboard Scatter-to-Grid Effect
 * Inspired by making.today "Cards Fall Into Grid"
 *
 * Cards start rotated, scaled down, and pushed upward (peeking from
 * behind the hero). When the dashboard section scrolls into view the
 * cards settle into their natural grid positions via CSS transitions.
 * Scrolling back up scatters them again.
 */
(function () {
  'use strict';

  var box = document.querySelector('.pdb-box');
  if (!box) return;

  var items = box.querySelectorAll('.pdb-card, .pdb-inbox');
  if (!items.length) return;

  /* Unique rotation per card (range roughly -18 to +16 degrees) */
  var rotations = [8, -12, 14, -5, -16, 7, 11, -9, 3, -14, 6];

  /* Assign per-card CSS custom properties used by the stylesheet */
  items.forEach(function (el, i) {
    el.style.setProperty('--scatter-rotate', rotations[i % rotations.length] + 'deg');
    el.style.setProperty('--scatter-delay', (i * 0.05) + 's');
  });

  /* Observe the dashboard section */
  var section = document.querySelector('.dashboard-section');
  if (!section) return;

  var settled = false;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var shouldSettle = entry.isIntersecting && entry.intersectionRatio >= 0.08;

        if (shouldSettle && !settled) {
          box.classList.add('cards-settled');
          settled = true;
        } else if (!shouldSettle && settled) {
          box.classList.remove('cards-settled');
          settled = false;
        }
      });
    },
    { threshold: [0, 0.05, 0.08, 0.15, 0.25] }
  );

  observer.observe(section);
})();
