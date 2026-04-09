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

  /* Prevent the browser from restoring a previous scroll position,
   * which would cause the page to jump on load after freeze adjusts heights. */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

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
        var naturalH = innerEl.scrollHeight;

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

    window.addEventListener('resize', apply);
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

        /* Fix the wrap at its natural content width */
        wrap.style.width           = frozenW + 'px';
        wrap.style.transform       = '';
        wrap.style.transformOrigin = '';
        void wrap.offsetHeight;
        var naturalH = wrap.scrollHeight;

        /* Scale from the top-centre so centred layouts stay centred */
        var availW = outerEl.offsetWidth;
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

    window.addEventListener('resize', apply);
    apply();
  }

  /* ─────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. Dashboard ──────────────────────────────────────────
     * pdb-layout CSS breakpoint: max-width 900px
     * dashboard-section horizontal padding: 80px (40 × 2)
     * Frozen container width at 900vw: 900 − 80 = 820px          */

    var dashSection = document.querySelector('.dashboard-section');
    var dashInner   = document.querySelector('.dashboard-container');
    var pdbLayout   = document.querySelector('.dashboard-section .pdb-layout');
    var pdbRight    = document.querySelector('.dashboard-section .pdb-right');
    var pdbPairs    = Array.from(document.querySelectorAll('.dashboard-section .pdb-pair'));

    if (dashSection && dashInner && pdbLayout) {
      var dashOvr = [
        { el: pdbLayout, prop: 'gridTemplateColumns', val: '2fr 0.82fr' },
        { el: pdbLayout, prop: 'gap',                 val: '16px'       }
      ];
      if (pdbRight) {
        dashOvr.push(
          { el: pdbRight, prop: 'display',             val: 'flex'   },
          { el: pdbRight, prop: 'flexDirection',       val: 'column' },
          { el: pdbRight, prop: 'gridTemplateColumns', val: ''       }
        );
      }
      pdbPairs.forEach(function (p) {
        dashOvr.push(
          { el: p, prop: 'gridTemplateColumns', val: '1fr 1fr' },
          { el: p, prop: 'gap',                 val: '16px'   }
        );
      });

      freeze(dashSection, dashInner, 900, 820, dashOvr);
    }

    /* ── 2. Track Your Loan Progress ───────────────────────────
     * "Amount Due for Payment 3: $150.00" wraps at approx 940px vw.
     * feature-section horizontal padding: 80px (40 × 2)
     * Frozen inner width at 940vw: min(940 − 80, 900) = 860px     */

    var loanSection = document.querySelector('.feature-section-stacked');
    var loanInner   = loanSection && loanSection.querySelector('.feature-stacked');
    var lddGrid     = loanSection && loanSection.querySelector('.ldd-content-grid');

    if (loanSection && loanInner) {
      var loanOvr = lddGrid ? [
        { el: lddGrid, prop: 'gridTemplateColumns', val: '1fr 1fr' },
        { el: lddGrid, prop: 'gap',                 val: '10px'   }
      ] : [];

      freeze(loanSection, loanInner, 940, 860, loanOvr);
    }

    /* ── 3. Payments at a Glance — feature-image ───────────────
     * mini-cal (190px) + upcard-stack (max 420px) – 18px overlap ≈ 592px.
     * Scale both together from the mobile breakpoint so the mini-cal
     * (a reminder widget) always scales at the same rate as the cards. */

    var paymentsSection = document.querySelector('.feature-section:not(.feature-section-stacked)');
    var featureImage    = paymentsSection && paymentsSection.querySelector('.feature-image');

    if (featureImage) {
      scaleImageWrap(
        featureImage,
        900,
        592,
        'display:flex;align-items:flex-end;position:relative;'
      );
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

    /* ── Scroll to top after layout settles ────────────────────
     * Prevents any residual browser scroll restoration from jumping
     * the page down after freeze-scale adjusts section heights.    */
    requestAnimationFrame(function () {
      window.scrollTo(0, 0);
    });

  });

}());
