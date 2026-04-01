// Glass nav dropdown hover logic
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.getElementById('mainNav');
  if (!nav) return;

  var items = nav.querySelectorAll('.nav-item.has-dropdown');
  var panels = nav.querySelectorAll('.dropdown-panel');
  var closeTimeout = null;
  var activePanel = null;

  function openPanel(panelName) {
    clearTimeout(closeTimeout);

    // Hide all panels
    panels.forEach(function (p) { p.classList.remove('active'); });

    // Show the target panel
    var target = nav.querySelector('.dropdown-panel[data-panel="' + panelName + '"]');
    if (!target) return;

    target.classList.add('active');
    nav.classList.add('panel-open');
    activePanel = panelName;

    // Measure the panel to size the glass background
    var layout = target.querySelector('.dropdown-layout') || target.querySelector('.dropdown-grid');
    var navRect = nav.getBoundingClientRect();
    var panelW = layout ? layout.offsetWidth + 40 : navRect.width;
    var panelH = navRect.height + (layout ? layout.offsetHeight + 40 : 0);

    // Ensure min width covers the nav bar itself
    if (panelW < navRect.width) panelW = navRect.width;

    nav.style.setProperty('--panel-width', panelW + 'px');
    nav.style.setProperty('--panel-height', panelH + 'px');
  }

  function closeAllPanels() {
    closeTimeout = setTimeout(function () {
      panels.forEach(function (p) { p.classList.remove('active'); });
      nav.classList.remove('panel-open');
      nav.style.removeProperty('--panel-width');
      nav.style.removeProperty('--panel-height');
      activePanel = null;
    }, 120);
  }

  // Hover on nav items with dropdowns
  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      var panelName = item.getAttribute('data-panel');
      openPanel(panelName);
    });
  });

  // Nav items WITHOUT dropdowns (e.g. Contact) close panels immediately
  var plainItems = nav.querySelectorAll('.nav-item:not(.has-dropdown)');
  plainItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      clearTimeout(closeTimeout);
      panels.forEach(function (p) { p.classList.remove('active'); });
      nav.classList.remove('panel-open');
      nav.style.removeProperty('--panel-width');
      nav.style.removeProperty('--panel-height');
      activePanel = null;
    });
  });

  // Keep panel open when hovering over dropdown content
  panels.forEach(function (panel) {
    panel.addEventListener('mouseenter', function () {
      clearTimeout(closeTimeout);
    });
    panel.addEventListener('mouseleave', function () {
      closeAllPanels();
    });
  });

  // Close when leaving the entire nav area
  nav.addEventListener('mouseleave', function () {
    closeAllPanels();
  });

  // Also keep open when re-entering nav from panel
  nav.addEventListener('mouseenter', function () {
    if (activePanel) {
      clearTimeout(closeTimeout);
    }
  });
});
