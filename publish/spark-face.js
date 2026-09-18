(function () {
  // Drives the scroll-companion's facial expression independently of the
  // React component lifecycle — mirrors the reliable polling pattern used by
  // reveal.js in this project, so it isn't affected by any component
  // remount/interval-clearing and keeps working under automated/scripted
  // scrolling, not just real user scroll gestures.
  // Penguins don't have an expressive mouth — the parametrized "mouth" path
  // instead draws a soft blush mark on the cheek that appears for warmer
  // moods, while the eye shape carries most of the expression.
  var EXPRESSIONS = {
    happy: {
      eyeL: '<circle cx="33" cy="34" r="3.6" fill="#0b0908"/><circle cx="34.1" cy="32.9" r="1.1" fill="#f5f1ea"/>',
      mouth: 'M28 50 a5 3.5 0 1 0 0.1 0',
      mouthOpacity: 0
    },
    excited: {
      eyeL: '<circle cx="33" cy="33" r="4.6" fill="#0b0908"/><circle cx="34.4" cy="31.5" r="1.3" fill="#f5f1ea"/>',
      mouth: 'M28 50 a6 4 0 1 0 0.1 0',
      mouthOpacity: 0.55
    },
    wink: {
      eyeL: '<path d="M28.5 34 Q33 30 37.5 34" stroke="#0b0908" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
      mouth: 'M28 50 a5 3.5 0 1 0 0.1 0',
      mouthOpacity: 0.3
    },
    thinking: {
      eyeL: '<circle cx="33" cy="32.5" r="3.1" fill="#0b0908"/><circle cx="33.9" cy="31.4" r="0.9" fill="#f5f1ea"/>',
      mouth: 'M28 50 a5 3.5 0 1 0 0.1 0',
      mouthOpacity: 0
    },
    love: {
      eyeL: '<path d="M33 30 Q29.5 26.5 27 30 Q29.5 34 33 37.5 Q36.5 34 39 30 Q36.5 26.5 33 30 Z" fill="#f5f1ea"/>',
      mouth: 'M28 50 a6.5 4.5 0 1 0 0.1 0',
      mouthOpacity: 0.75
    }
  };

  var lastMood = null;

  // IMPORTANT: this used to mutate the eye/mouth DOM directly via innerHTML
  // and setAttribute. That fought with React's reconciliation of the same
  // SVG subtree (the penguin is rendered by a DCLogic component) — any
  // unrelated re-render of that component would diff against a DOM that had
  // been changed out from under it, throwing
  // "Failed to execute 'removeChild' on 'Node'" crashes. This function now
  // only decides the mood and hands it to the host page via a callback the
  // Component registers in componentDidMount; the Component owns rendering
  // the correct eye/mouth markup through normal React state, so React and
  // the DOM never disagree.
  function applyMood(mood) {
    if (mood === lastMood) return;
    if (!EXPRESSIONS[mood]) return;
    lastMood = mood;
    if (typeof window.__sparkOnMood === 'function') window.__sparkOnMood(mood);
  }

  function check() {
    var sections = document.querySelectorAll('[data-spark-section]');
    if (!sections.length) return;
    var centerY = window.innerHeight / 2;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= centerY && rect.bottom >= centerY) {
        applyMood(sections[i].getAttribute('data-spark-section'));
        return;
      }
    }
  }

  ['scroll', 'wheel', 'touchmove', 'resize'].forEach(function (evt) {
    window.addEventListener(evt, check, { passive: true });
  });
  document.addEventListener('scroll', check, { passive: true, capture: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
  // Poll via a chained postMessage macrotask rather than setInterval/rAF:
  // background/hidden documents are throttled hard by browsers to >=1000ms
  // for setInterval/setTimeout and can suspend rAF entirely (confirmed via
  // document.visibilityState === "hidden" in this preview's automated
  // testing context), but postMessage-driven tasks are NOT subject to that
  // background-timer clamp, so this keeps the section check running at full
  // speed even while the tab/iframe is not the active, focused one. Actual
  // work is throttled internally to roughly every 100ms so the tight
  // macrotask loop doesn't spin the CPU.
  var channel = new MessageChannel();
  var lastRun = 0;
  channel.port1.onmessage = function () {
    var now = Date.now();
    if (now - lastRun >= 100) {
      lastRun = now;
      check();
    }
    channel.port2.postMessage(null);
  };
  channel.port2.postMessage(null);
})();
