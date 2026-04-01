document.addEventListener('DOMContentLoaded', function () {
  var list = document.getElementById('tickerList');
  if (!list) return;

  var notifications = [
    { emoji: '💰', title: 'Payment received from Sarah', subtitle: '$45.00 — Dinner last Friday' },
    { emoji: '📋', title: 'New loan agreement created', subtitle: 'Jake — $200 for concert tickets' },
    { emoji: '⏰', title: 'Payment reminder sent', subtitle: 'Alex owes you $30 — due tomorrow' },
    { emoji: '✅', title: 'Loan fully repaid', subtitle: 'Mike paid off $150 — camping trip' },
    { emoji: '🔔', title: 'Interest applied automatically', subtitle: '2% on $500 loan to Emma' }
  ];

  var DUPLICATIONS = 4;

  for (var d = 0; d < DUPLICATIONS; d++) {
    for (var i = 0; i < notifications.length; i++) {
      var notif = notifications[i];
      var li = document.createElement('li');
      li.className = 'notification-item';
      li.innerHTML =
        '<div class="notif-avatar">' + notif.emoji + '</div>' +
        '<div class="notif-content">' +
        '<div class="notif-item-title">' + notif.title + '</div>' +
        '<div class="notif-item-sub">' + notif.subtitle + '</div>' +
        '</div>';
      list.appendChild(li);
    }
  }

  var ITEM_HEIGHT = 62;
  var GAP = 7;
  var ITEM_TOTAL = ITEM_HEIGHT + GAP;
  var CYCLE_PX = notifications.length * ITEM_TOTAL;
  var RESET_PX = CYCLE_PX * 2;
  var SPEED = 40;

  var currentY = 0;
  var lastTime = null;
  var running = false;

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    currentY -= SPEED * delta;

    if (currentY <= -RESET_PX) {
      currentY += CYCLE_PX;
    }

    list.style.transform = 'translateY(' + currentY + 'px)';
    requestAnimationFrame(animate);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !running) {
        running = true;
        requestAnimationFrame(animate);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(document.querySelector('.ticker-wrapper'));
});
