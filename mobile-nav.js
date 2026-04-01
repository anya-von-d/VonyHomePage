/* ─── Mobile Hamburger Navigation ─── */
(function () {
  var toggle = document.getElementById('hamburgerToggle');
  var panel = document.getElementById('mobileNav');
  if (!toggle || !panel) return;

  // Toggle open/close
  toggle.addEventListener('click', function () {
    var isOpen = toggle.classList.toggle('menuOpen');
    if (isOpen) {
      panel.classList.add('open');
    } else {
      panel.classList.remove('open');
      // Close all submenus
      panel.querySelectorAll('.mobile-nav-group.expanded').forEach(function (g) {
        g.classList.remove('expanded');
      });
    }
  });

  // Accordion submenus
  panel.querySelectorAll('.mobile-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.parentElement;
      var wasExpanded = group.classList.contains('expanded');

      // Close all other submenus
      panel.querySelectorAll('.mobile-nav-group.expanded').forEach(function (g) {
        g.classList.remove('expanded');
      });

      // Toggle this one
      if (!wasExpanded) {
        group.classList.add('expanded');
      }
    });
  });

  // Close on clicking outside
  document.addEventListener('click', function (e) {
    if (!panel.classList.contains('open')) return;
    if (!panel.contains(e.target) && !toggle.contains(e.target)) {
      toggle.classList.remove('menuOpen');
      panel.classList.remove('open');
      panel.querySelectorAll('.mobile-nav-group.expanded').forEach(function (g) {
        g.classList.remove('expanded');
      });
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      toggle.classList.remove('menuOpen');
      panel.classList.remove('open');
      panel.querySelectorAll('.mobile-nav-group.expanded').forEach(function (g) {
        g.classList.remove('expanded');
      });
    }
  });
})();
