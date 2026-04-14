/* freeze-scale.js
 * Locks sections at the viewport width where their layout would break,
 * then scales the frozen content to fit smaller screens rather than reflowing.
 *
 * Section 1 — Dashboard (.dashboard-section)
 *   Freezes just before pdb-layout collapses from [2fr 0.82fr] → [1fr] at 900px.
 *
 * Section 2 — Track Your Loan Progress (.feature-section-stacked)
 *   Freezes just before "Amount Due for Payment 3: $150.00" wraps to two lines (~940px).
 *
 * Section 3 — Payments at a Glance (.feature-image)
 *   mini-cal (190px) + upcard-stack (420px) – 18px overlap = 592px natural width.
 *   Scales both elements together so they never overflow on narrow screens.
 *
 * Section 4 — Notifications (.notif-left)
 *   notif-card (400px) + bell-container icon scale together at the same rate.
 */
(function () {
  'use strict';

  /* scrollRestoration left as browser default — no forced scroll-to-top */

  /* ─────────────────────────────────────────────────────────── */

  /**
   * freeze(sectionEl, innerEl, breakVW, frozenW, overrides)
   *
   * sectionEl  — outer section used as the clipping / height anchor
   * innerEl    — the element whose layout is frozen and then scaled
   * breakVW    — viewport width (px) below which the freeze activates
   * frozenW    — the content width (px) innerEl is locked to while frozen
   *              (uses minWidth to override CSS media-query reflowing)
   * overrides  — [{el, prop, val}] inline styles to force while frozen,
   *              counteracting CSS media-query changes
   */
  var lastWidth = window.innerWidth;

  function freeze(sectionEl, innerEl, breakVW, frozenW, overrides) {
    var cs = getComputedStyle(sectionEl);
    var pt = parseFloat(cs.paddingTop)    || 0;
    var pb = parseFloat(cs.paddingBottom) || 0;
    var pl = parseFloat(cs.paddingLeft)   || 0;
    var pr = parseFloat(cs.paddingRight)  || 0;

    function apply() {
      if (window.innerWidth < breakVW) {

        /* 1 — Apply layout overrides (fight CSS media-query reflowing) */
        overrides.forEach(function (o) { o.el.style[o.prop] = o.val; });

        /* 2 — Lock width and measure natural height before scaling */
        innerEl.style.minWidth        = frozenW + 'px';
        innerEl.style.transform       = '';
        innerEl.style.transformOrigin = '';
        void innerEl.offsetHeight;           /* force layout recalc */

        /* Use the tallest visible child's full height (scrollHeight),
         * since the grid container's scrollHeight may not capture
         * children that overflow their grid cell.                  */
        var naturalH = innerEl.scrollHeight;
        Array.from(innerEl.children).forEach(function (child) {
          if (getComputedStyle(child).display !== 'none') {
            var h = Math.max(child.scrollHeight, child.offsetHeight);
            if (h > naturalH) naturalH = h;
          }
        });

        /* 3 — Scale down to fit available content width */
        var availW = sectionEl.offsetWidth - pl - pr;
        var scale  = Math.min(1, availW / frozenW); /* never scale up */

        innerEl.style.transformOrigin = 'top left';
        innerEl.style.transform       = 'scale(' + scale + ')';

        /* 4 — Collapse section height so the shrunken content leaves no gap */
        sectionEl.style.overflow = 'hidden';
        sectionEl.style.height   = (pt + naturalH * scale + pb) + 'px';

      } else {

        overrides.forEach(function (o) { o.el.style[o.prop] = ''; });
        innerEl.style.minWidth        = '';
        innerEl.style.transform       = '';
        innerEl.style.transformOrigin = '';
        sectionEl.style.overflow      = '';
        sectionEl.style.height        = '';

      }
    }

    window.addEventListener('resize', function () {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        apply();
      }
    });
    apply();
  }

  /* ─────────────────────────────────────────────────────────── */

  /**
   * scaleImageWrap(outerEl, breakVW, frozenW, wrapStyle)
   *
   * Wraps outerEl's children in a new div (the "wrap"), scales the wrap to
   * fit outerEl's available width, and adjusts outerEl's height accordingly.
   * Because all children are inside the wrap, every overlay — notification
   * banners, badges, icons — scales at exactly the same rate as the image.
   *
   * outerEl   — container element that clips and sizes around the scaled content
   * breakVW   — viewport width (px) below which the scale activates
   * frozenW   — natural content width (px) the wrap is locked to
   * wrapStyle — cssText applied to the wrap div to restore any flex layout
   *             that outerEl previously provided to its children
   */
  function scaleImageWrap(outerEl, breakVW, frozenW, wrapStyle) {
    var wrap = document.createElement('div');
    if (wrapStyle) { wrap.style.cssText = wrapStyle; }
    while (outerEl.firstChild) {
      wrap.appendChild(outerEl.firstChild);
    }
    outerEl.appendChild(wrap);

    function apply() {
      if (window.innerWidth < breakVW) {

        /* Measure available width BEFORE the wrap forces the parent wider */
        wrap.style.width = '0';
        void outerEl.offsetWidth;
        var availW = outerEl.offsetWidth;

        /* Fix the wrap at its natural content width */
        wrap.style.width           = frozenW + 'px';
        wrap.style.transform       = '';
        wrap.style.transformOrigin = '';
        void wrap.offsetHeight;
        var naturalH = Math.max(wrap.scrollHeight, wrap.getBoundingClientRect().height);

        /* Scale from the top-centre so centred layouts stay centred */
        var scale  = Math.min(1, availW / frozenW);

        wrap.style.transformOrigin = 'top center';
        wrap.style.transform       = 'scale(' + scale + ')';

        /* Collapse the outer element so scaled content leaves no gap */
        outerEl.style.height   = (naturalH * scale) + 'px';
        outerEl.style.overflow = 'hidden';

      } else {

        wrap.style.width           = '';
        wrap.style.transform       = '';
        wrap.style.transformOrigin = '';
        outerEl.style.height       = '';
        outerEl.style.overflow     = '';

      }
    }

    window.addEventListener('resize', function () {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        apply();
      }
    });
    apply();
  }

  /* ─────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. Dashboard ──────────────────────────────────────────
     * New VonyPortal layout: summary-row (3 cols) + masonry (2 cols).
     * Freeze at 900px, lock to 820px natural width, scale down.     */

    var dashSection  = document.querySelector('.dashboard-section');
    var dashInner    = document.querySelector('.dashboard-container');
    var summaryRow   = document.querySelector('.pdb-summary-row');
    var masonry      = document.querySelector('.pdb-masonry');

    if (dashSection && dashInner && (summaryRow || masonry)) {
      var dashOvr = [];
      if (summaryRow) {
        dashOvr.push(
          { el: summaryRow, prop: 'gridTemplateColumns', val: '1fr 1fr' },
          { el: summaryRow, prop: 'gap',                 val: '24px'    }
        );
      }
      if (masonry) {
        dashOvr.push(
          { el: masonry, prop: 'gridTemplateColumns', val: '1fr 1fr' },
          { el: masonry, prop: 'gap',                 val: '24px'   }
        );
      }

      freeze(dashSection, dashInner, 900, 820, dashOvr);
    }

    /* ── 2. Track Your Loan Progress ───────────────────────────
     * tylp-detail-box layout: top-row (2fr 1fr) + two-col (1fr 1fr).
     * Freeze at 940px, lock to 860px, scale down.                   */

    var loanSection = document.querySelector('.feature-section-stacked');
    var loanInner   = loanSection && loanSection.querySelector('.feature-stacked');
    var tylpTopRow  = loanSection && loanSection.querySelector('.tylp-top-row');
    var tylpTwoCols = loanSection ? Array.from(loanSection.querySelectorAll('.tylp-two-col')) : [];

    if (loanSection && loanInner) {
      var loanOvr = [];
      if (tylpTopRow) {
        loanOvr.push(
          { el: tylpTopRow, prop: 'gridTemplateColumns', val: '2fr 1fr' },
          { el: tylpTopRow, prop: 'gap',                 val: '16px'   }
        );
      }
      tylpTwoCols.forEach(function (col) {
        loanOvr.push(
          { el: col, prop: 'gridTemplateColumns', val: '1fr 1fr' },
          { el: col, prop: 'gap',                 val: '24px'   }
        );
      });

      freeze(loanSection, loanInner, 940, 700, loanOvr);
    }

    /* ── 3. Payments at a Glance ─────────────────────────────────
     * feature-inner is a 2-column grid (text | image).
     * Freeze the entire section so both text and image scale together. */

    var paymentsSection = document.querySelector('.feature-section:not(.feature-section-stacked)');
    var featureInner    = paymentsSection && paymentsSection.querySelector('.feature-inner');

    if (paymentsSection && featureInner) {
      var featureText  = featureInner.querySelector('.feature-text');
      var featureImg   = featureInner.querySelector('.feature-image');
      var payOvr = [
        { el: featureInner, prop: 'gridTemplateColumns', val: '1fr' },
        { el: featureInner, prop: 'gap',                 val: '0px' }
      ];
      if (featureImg)  payOvr.push({ el: featureImg,  prop: 'order', val: '-1' });
      if (featureText) payOvr.push({ el: featureText, prop: 'display', val: 'none' });

      freeze(paymentsSection, featureInner, 900, 500, payOvr);
    }

    /* ── 4. Notifications — notif-left ─────────────────────────
     * notif-card is fixed at 400px. Scale it together with the
     * bell-container icon so the icon shrinks at the same rate.   */

    var notifLeft = document.querySelector('.notif-left');

    if (notifLeft) {
      scaleImageWrap(
        notifLeft,
        900,
        400,
        'display:block;'
      );
    }

    /* No forced scroll — let the browser handle scroll position naturally */

  });

}());
