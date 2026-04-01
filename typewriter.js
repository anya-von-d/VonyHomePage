/* ─── Typewriter Effect for Hero Title ─── */
(function () {
  const words = [
    'Messy',
    'Stressful',
    'Awkward',
    'Confusing',
    'Forgettable',
    'Uncomfortable',
    'Complicated',
    'Risky'
  ];

  const TYPE_SPEED   = 90;   // ms per character when typing
  const DELETE_SPEED  = 60;   // ms per character when deleting
  const PAUSE_AFTER   = 2000; // ms to pause after full word is typed
  const WAIT_BEFORE   = 400;  // ms to wait after deleting before next word
  const INITIAL_DELAY = 1500; // ms before first animation starts

  const el = document.getElementById('typewriter-word');
  if (!el) return;

  let wordIndex = 0;
  let charIndex = words[0].length; // start with full first word
  let state = 'PAUSING'; // TYPING | PAUSING | DELETING | WAITING

  function tick() {
    const currentWord = words[wordIndex];

    switch (state) {
      case 'PAUSING':
        // Full word is shown — wait, then start deleting
        setTimeout(() => {
          state = 'DELETING';
          tick();
        }, PAUSE_AFTER);
        break;

      case 'DELETING':
        if (charIndex > 0) {
          charIndex--;
          el.textContent = currentWord.slice(0, charIndex);
          setTimeout(tick, DELETE_SPEED);
        } else {
          // Word fully deleted — move to next word
          wordIndex = (wordIndex + 1) % words.length;
          state = 'WAITING';
          setTimeout(tick, WAIT_BEFORE);
        }
        break;

      case 'WAITING':
        // Brief pause before typing next word
        state = 'TYPING';
        charIndex = 0;
        tick();
        break;

      case 'TYPING':
        const nextWord = words[wordIndex];
        if (charIndex < nextWord.length) {
          charIndex++;
          el.textContent = nextWord.slice(0, charIndex);
          setTimeout(tick, TYPE_SPEED);
        } else {
          // Word fully typed — pause
          state = 'PAUSING';
          tick();
        }
        break;
    }
  }

  // Start after initial delay so user reads the first word
  setTimeout(tick, INITIAL_DELAY);
})();
