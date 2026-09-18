(function () {
  function checkAll() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var els = document.querySelectorAll('[data-reveal]:not([data-revealed])');
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < vh - 60 && rect.bottom > 0) {
        var delay = el.getAttribute('data-reveal-delay') || '0';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms';
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.setAttribute('data-revealed', '');
      }
    });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { checkAll(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAll);
  } else {
    checkAll();
  }
  // Repeated checks for a few seconds to catch late-streaming/async-mounted DOM
  var n = 0;
  var t = setInterval(function () {
    checkAll();
    n++;
    if (n > 25) clearInterval(t);
  }, 300);
})();
