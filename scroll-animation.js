// Corner-scatter → organized grid scroll animation
// Cards start scattered around the four corners of the viewport,
// then smoothly converge into the grid as the user scrolls.
document.addEventListener('DOMContentLoaded', function () {
  var grid = document.querySelector('.dashboard-grid');
  var section = document.querySelector('.dashboard-section');
  var cards = document.querySelectorAll('.card');
  if (!grid || !section || cards.length === 0) return;

  var offsets = [];

  // Each card gets a corner assignment + jitter for organic scatter
  // Corners: 0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right
  var scatterMap = [
    { corner: 0, jx: 20,   jy: 15,  r: -12 },  // Loan Summary
    { corner: 1, jx: -35,  jy: 25,  r: 8   },  // Payment Schedule
    { corner: 1, jx: 20,   jy: -10, r: -6  },  // Balance
    { corner: 3, jx: -20,  jy: -25, r: 10  },  // Friends
    { corner: 0, jx: 45,   jy: 55,  r: 7   },  // Activity Feed
    { corner: 2, jx: 15,   jy: -15, r: -9  },  // Lending History
    { corner: 3, jx: 25,   jy: 30,  r: -7  },  // Reminders
    { corner: 2, jx: -30,  jy: 25,  r: 8   },  // Repayment Chart
    { corner: 0, jx: -10,  jy: 85,  r: -5  },  // Notifications
    { corner: 3, jx: -45,  jy: -5,  r: 11  },  // Trust Score
    { corner: 2, jx: 50,   jy: -40, r: -8  },  // Agreements
    { corner: 1, jx: 10,   jy: 60,  r: 6   },  // Quick Actions
  ];

  function init() {
    offsets = [];
    if (window.innerWidth <= 1024) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.transform = 'none';
        cards[i].style.opacity = '1';
      }
      return;
    }

    var vh = window.innerHeight;
    var vw = window.innerWidth;

    // Reset transforms to compute natural flow positions
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.transform = 'none';
      cards[i].style.opacity = '1';
    }
    grid.offsetHeight; // force reflow

    var gr = grid.getBoundingClientRect();

    // The grid will become sticky at top: 100px (CSS value)
    // Compute the shift from current flow position to sticky position
    var stickyTop = 100;
    var deltaY = stickyTop - gr.top;

    // Corner target positions in viewport coordinates
    var corners = [
      { x: vw * 0.10, y: vh * 0.18 },   // top-left
      { x: vw * 0.84, y: vh * 0.15 },   // top-right
      { x: vw * 0.08, y: vh * 0.78 },   // bottom-left
      { x: vw * 0.86, y: vh * 0.74 },   // bottom-right
    ];

    for (var i = 0; i < cards.length; i++) {
      var cr = cards[i].getBoundingClientRect();
      var cardCX = cr.left + cr.width / 2;
      var cardCY = cr.top + cr.height / 2;
      var sm = scatterMap[i];
      var corner = corners[sm.corner];

      // Compute offset: when grid is sticky, card center will be at (cardCX, cardCY + deltaY)
      // We want it at the corner position + jitter
      offsets.push({
        x: (corner.x - cardCX) + sm.jx,
        y: (corner.y - (cardCY + deltaY)) + sm.jy,
        r: sm.r
      });
    }

    update();
  }

  function update() {
    if (offsets.length === 0 || window.innerWidth <= 1024) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.transform = 'none';
        cards[i].style.opacity = '1';
      }
      return;
    }

    // Progress based on scroll position from top of page
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;
    var progress = scrollY / (vh * 0.75);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Cubic ease-out for smooth deceleration
    var ease = 1 - Math.pow(1 - progress, 3);

    for (var i = 0; i < cards.length; i++) {
      var o = offsets[i];
      if (ease >= 0.995) {
        cards[i].style.transform = 'none';
        cards[i].style.opacity = '1';
      } else {
        var inv = 1 - ease;
        var s = 0.82 + ease * 0.18; // scale 0.82 → 1.0
        cards[i].style.transform =
          'translateX(' + (o.x * inv) + 'px) translateY(' + (o.y * inv) + 'px) rotate(' + (o.r * inv) + 'deg) scale(' + s + ')';
        cards[i].style.opacity = String(0.45 + ease * 0.55);
      }
    }
  }

  window.__scrollUpdate = update;
  window.addEventListener('scroll', update, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(init, 200);
  });

  init();
});
