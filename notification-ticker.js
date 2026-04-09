document.addEventListener('DOMContentLoaded', function () {
  var list = document.getElementById('tickerList');
  if (!list) return;

  // SVG icons matching the VonyPortal notifications page
  var clockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var dollarSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  var docSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  var peopleSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var alertSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var checkSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  var notifications = [
    { color: '#E8726E', bg: 'rgba(232,114,110,0.12)', icon: clockSvg,   title: "Jordan's payment to you is overdue",         subtitle: "If they've already paid, make sure to record it." },
    { color: '#03ACEA', bg: 'rgba(3,172,234,0.12)',   icon: clockSvg,   title: "You have an upcoming payment to Alex",         subtitle: "Make sure to record the payment once it's made." },
    { color: '#2563EB', bg: 'rgba(37,99,235,0.12)',   icon: docSvg,     title: "Sam sent you a loan offer for rent",           subtitle: null },
    { color: '#16A34A', bg: 'rgba(22,163,74,0.12)',   icon: dollarSvg,  title: "Alex recorded a payment of $150.00",           subtitle: null },
    { color: '#E8726E', bg: 'rgba(232,114,110,0.12)', icon: clockSvg,   title: "Your payment to Jordan is overdue",            subtitle: "If you've already paid, make sure to record it." },
    { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)',  icon: peopleSvg,  title: "Priya sent you a friend request",              subtitle: null },
    { color: '#03ACEA', bg: 'rgba(3,172,234,0.12)',   icon: clockSvg,   title: "You are due to receive a payment from Sam",    subtitle: "Make sure to record the payment once it's received." },
    { color: '#D97706', bg: 'rgba(217,119,6,0.12)',   icon: alertSvg,   title: "Sam sent you a loan change request",           subtitle: null },
    { color: '#16A34A', bg: 'rgba(22,163,74,0.12)',   icon: checkSvg,   title: "Jordan confirmed your $80 payment",            subtitle: null },
    { color: '#03ACEA', bg: 'rgba(3,172,234,0.12)',   icon: clockSvg,   title: "You have a payment due today to Alex",         subtitle: "Make sure to record the payment once it's made." },
  ];

  var DUPLICATIONS = 4;

  for (var d = 0; d < DUPLICATIONS; d++) {
    for (var i = 0; i < notifications.length; i++) {
      var notif = notifications[i];
      var li = document.createElement('li');
      li.className = 'notification-item';
      li.innerHTML =
        '<div class="notif-avatar" style="background:' + notif.bg + '; border-radius:8px; color:' + notif.color + '; width:36px; height:36px; font-size:inherit; display:flex; align-items:center; justify-content:center; flex-shrink:0;">' +
          notif.icon +
        '</div>' +
        '<div class="notif-content">' +
          '<div class="notif-item-title">' + notif.title + '</div>' +
          (notif.subtitle ? '<div class="notif-item-sub">' + notif.subtitle + '</div>' : '') +
        '</div>';
      list.appendChild(li);
    }
  }

  var ITEM_HEIGHT = 62;
  var GAP = 7;
  var ITEM_TOTAL = ITEM_HEIGHT + GAP;
  var CYCLE_PX = notifications.length * ITEM_TOTAL;
  var RESET_PX = CYCLE_PX * 2;
  var SPEED = 35;

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
