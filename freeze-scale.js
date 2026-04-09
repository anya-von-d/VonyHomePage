/* freeze-scale.js
 * Locks two sections at the viewport width where their layout would break,
 * then scales the frozen content to fit smaller screens rather than reflowing.
 *
 * Section 1 — Dashboard (.dashboard-section)
 *   Freezes just before pdb-layout collapses from [2fr 0.82fr] → [1fr] at 900px.
 *
 * Section 2 — Track Your Loan Progress (.feature-section-stacked)
 *   Freezes just before "Amount Due for Payment 3: $150.00" wraps to two lines.
 */
(function () {
  'use strict';

  /**
   * freeze(sectionEl, innerEl, breakVW, frozenW, overrides)
   *
   * sectionEl  — outer section used as the clipping/height anchor
   * innerEl    — the element whose layout is frozen and then scaled
   * breakVW    — viewport width (px) below which the freeze activates
   * frozenW    — the content width (px) innerEl is locked to while frozen
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
     * "Amount Due for Payment 3: $150.00" wraps at approx 860px vw.
     * feature-section horizontal padding: 80px (40 × 2)
     * Frozen inner width at 860vw: min(860 − 80, 900) = 780px     */

    var loanSection = document.querySelector('.feature-section-stacked');
    var loanInner   = loanSection && loanSection.querySelector('.feature-stacked');
    var lddGrid     = loanSection && loanSection.querySelector('.ldd-content-grid');

    if (loanSection && loanInner) {
      var loanOvr = lddGrid ? [
        { el: lddGrid, prop: 'gridTemplateColumns', val: '1fr 1fr' },
        { el: lddGrid, prop: 'gap',                 val: '10px'   }
      ] : [];

      freeze(loanSection, loanInner, 860, 780, loanOvr);
    }

  });

}());
