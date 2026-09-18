(function () {
  var KEY = 'ads-theme';

  var DARK_LOGO = 'assets/logo-white-gold-final.png';
  var LIGHT_LOGO = 'assets/logo-ink-red.png';

  function swapLogos(theme) {
    var want = theme === 'light' ? LIGHT_LOGO : DARK_LOGO;
    document.querySelectorAll('img[data-brand-logo]').forEach(function (img) {
      if (!img.__origLogo) img.__origLogo = img.getAttribute('src');
      // Only swap the standard brand lockup; leave any custom logo art alone.
      if (img.__origLogo !== DARK_LOGO && img.__origLogo !== LIGHT_LOGO) return;
      if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    });
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    swapLogos(theme);
  }

  // Apply saved (or default dark) theme as early as possible.
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved === 'dark' ? 'dark' : 'light');

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  }

  function wire() {
    swapLogos(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      if (btn.__wired) return;
      btn.__wired = true;
      btn.addEventListener('click', toggle);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
  // Re-scan periodically in case buttons mount later (DC templates stream in).
  var n = 0;
  var t = setInterval(function () {
    wire();
    n++;
    if (n > 20) clearInterval(t);
  }, 300);
})();
