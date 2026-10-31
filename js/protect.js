/* ==========================================================================
   PROTECTION NOTICE — PLEASE READ
   --------------------------------------------------------------------------
   These measures are DETERRENTS ONLY. Anything a browser can render can
   eventually be viewed, saved or reconstructed. This file makes casual
   copying and casual inspection inconvenient; it is not, and cannot be,
   real security. Never place secrets (API keys, passwords, private data)
   in static files — everything here is public by definition.

   WHAT THIS FILE DOES
   - Blocks the right-click context menu.
   - Blocks F12, Ctrl/Cmd+Shift+I / J / C / K, Ctrl/Cmd+U, Ctrl/Cmd+S.
   - Blocks copy/cut outside form fields and locks text selection.
   - Prevents images from being dragged off the page.
   - Watches for open developer tools (window-size gap + debugger timing)
     and covers the page with an "Inspection is disabled." message.

   BEFORE YOU UPLOAD — MINIFY / OBFUSCATE
   1. Keep this readable source in a separate local folder (for example
      ../source/js and ../source/css) that you do NOT upload.
   2. Minify the scripts with terser:
        npx terser js/main.js -c -m -o js/main.min.js
        npx terser js/protect.js -c -m -o js/protect.min.js
   3. Minify the stylesheet with cssnano:
        npx cssnano css/style.css css/style.min.css
   4. Point index.html at the minified files:
        <link rel="stylesheet" href="css/style.min.css">
        <script src="js/main.min.js" defer></script>
        <script src="js/protect.min.js" defer></script>
   5. Delete the readable .js/.css files from the published folder and do
      not publish source maps. Node/npm are only needed for this optional
      local step; the deployed site stays plain static files.
   ========================================================================== */

(function () {
  "use strict";

  // Search and social crawlers get the page untouched: no selection locking,
  // no overlay and no devtools checks, so indexed content is never blocked.
  var CRAWLER_UA = /Googlebot|Google-InspectionTool|Storebot-Google|Bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebookexternalhit|Twitterbot|LinkedInBot|Pinterestbot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|rogerbot|ia_archiver/i;
  if (CRAWLER_UA.test(navigator.userAgent || "")) return;

  var root = document.documentElement;
  var body = document.body;
  var EDITABLE = 'input, textarea, select, [contenteditable="true"]';

  /* -----------------------------------------------------------------------
     Selection + drag locking (form fields stay selectable)
     ----------------------------------------------------------------------- */

  root.classList.add("protected");

  function isEditable(target) {
    return !!(target && target.closest && target.closest(EDITABLE));
  }

  document.addEventListener(
    "contextmenu",
    function (event) {
      event.preventDefault();
    },
    true
  );

  document.addEventListener(
    "dragstart",
    function (event) {
      if (event.target && event.target.tagName === "IMG") {
        event.preventDefault();
      }
    },
    true
  );

  document.addEventListener(
    "selectstart",
    function (event) {
      if (!isEditable(event.target)) event.preventDefault();
    },
    true
  );

  function blockClipboard(event) {
    if (!isEditable(event.target)) event.preventDefault();
  }

  document.addEventListener("copy", blockClipboard, true);
  document.addEventListener("cut", blockClipboard, true);

  /* -----------------------------------------------------------------------
     Keyboard shortcuts
     ----------------------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    function (event) {
      var key = (event.key || "").toLowerCase();
      var code = event.keyCode || event.which;
      var modifier = event.ctrlKey || event.metaKey;

      if (key === "f12" || code === 123) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!modifier) return;

      var devtoolsShortcut =
        (event.shiftKey && (key === "i" || key === "j" || key === "c" || key === "k")) ||
        (event.altKey && (key === "i" || key === "j" || key === "c"));

      var viewSourceOrSave =
        (!event.shiftKey && !event.altKey && (key === "u" || key === "s"));

      if (devtoolsShortcut || viewSourceOrSave) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  /* -----------------------------------------------------------------------
     Developer tools detection
     ----------------------------------------------------------------------- */

  // Audit tools (Lighthouse, headless Chrome) emulate narrow viewports inside
  // a larger window and would otherwise be flagged. They are exempt so the
  // site can be audited and previewed; ordinary browsers are not.
  if (/lighthouse|headlesschrome|headless/i.test(navigator.userAgent)) {
    return;
  }

  var SIZE_GAP_PX = 160;
  var DEBUGGER_MS = 120;
  var CHECK_INTERVAL_MS = 1200;
  var CLEAN_CHECKS_BEFORE_RELEASE = 3;

  var overlay = null;
  var blocked = false;
  var cleanChecks = 0;

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "protection-overlay";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "protection-title");
    overlay.innerHTML =
      '<div class="protection-overlay__inner">' +
      '<span class="protection-overlay__icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/>' +
      '<path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>' +
      '<circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none"/>' +
      "</svg></span>" +
      '<h2 id="protection-title">Inspection is disabled.</h2>' +
      '<p>This is a personal portfolio. Please close your developer tools to continue browsing.</p>' +
      '<p class="signature">— Fahim</p>' +
      "</div>";
    body.appendChild(overlay);
    overlay.hidden = true;
  }

  function setBlocked(nextState) {
    if (nextState === blocked) return;
    blocked = nextState;

    if (blocked) {
      if (!overlay) buildOverlay();
      overlay.hidden = false;
      body.style.overflow = "hidden";
    } else {
      if (overlay) overlay.hidden = true;
      body.style.overflow = "";
    }
  }

  function devtoolsOpen() {
    var widthGap = window.outerWidth - window.innerWidth;
    var heightGap = window.outerHeight - window.innerHeight;

    if (widthGap > SIZE_GAP_PX || heightGap > SIZE_GAP_PX) return true;

    var start = performance.now();
    // The debugger pauses only when a debugger is attached.
    debugger; // eslint-disable-line no-debugger
    return performance.now() - start > DEBUGGER_MS;
  }

  function check() {
    if (document.hidden) return;

    if (devtoolsOpen()) {
      cleanChecks = 0;
      setBlocked(true);
      return;
    }

    if (blocked) {
      cleanChecks += 1;
      if (cleanChecks >= CLEAN_CHECKS_BEFORE_RELEASE) {
        cleanChecks = 0;
        setBlocked(false);
      }
    }
  }

  window.setInterval(check, CHECK_INTERVAL_MS);
  check();
})();
