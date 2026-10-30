/* ==========================================================================
   Tamzid Abdur Rahman — site interactions
   Navigation, scroll reveal, gallery lightbox, contact form and footer year.
   No dependencies. Loaded with `defer`.
   ========================================================================== */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var supportsObserver = "IntersectionObserver" in window;

  /* -----------------------------------------------------------------------
     Utilities
     ----------------------------------------------------------------------- */

  function setStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = "form-status" + (type ? " is-" + type : "");
  }

  /* -----------------------------------------------------------------------
     Footer year
     ----------------------------------------------------------------------- */

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------------------
     Header state + active navigation link
     ----------------------------------------------------------------------- */

  var header = document.getElementById("site-header");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-desktop a[href^="#"]:not(.btn)')
  );
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );

  function headerHeight() {
    return header ? header.offsetHeight : 72;
  }

  function updateActiveLink() {
    if (!navLinks.length || !sections.length) return;

    var position = window.scrollY + headerHeight() + 120;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.offsetTop <= position) current = section;
    });

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + current.id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      updateActiveLink();
      scrollQueued = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* -----------------------------------------------------------------------
     Mobile menu
     ----------------------------------------------------------------------- */

  var menuToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function setMenu(open, restoreFocus) {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (header) header.classList.toggle("menu-open", open);

    if (!open && restoreFocus) menuToggle.focus();
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true", false);
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        setMenu(false, true);
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 860px)");
    var handleDesktop = function (event) {
      if (event.matches && !mobileMenu.hidden) setMenu(false, false);
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktop);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktop);
    }
  }

  /* -----------------------------------------------------------------------
     Scroll reveal
     ----------------------------------------------------------------------- */

  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if (revealItems.length) {
    if (!reducedMotion.matches) {
      document.documentElement.classList.add("reveal-ready");
    }

    revealItems.forEach(function (item) {
      var delay = parseInt(item.getAttribute("data-delay") || "0", 10);
      if (delay > 0) item.style.transitionDelay = delay + "ms";
    });

    if (supportsObserver && !reducedMotion.matches) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    }
  }

  /* -----------------------------------------------------------------------
     Gallery lightbox
     ----------------------------------------------------------------------- */

  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCounter = document.getElementById("lightbox-counter");
  var triggers = Array.prototype.slice.call(
    document.querySelectorAll("[data-gallery-item]")
  );

  if (lightbox && lightboxImage && triggers.length) {
    var closeButton = lightbox.querySelector(".lightbox-close");
    var prevButton = lightbox.querySelector("[data-lightbox-prev]");
    var nextButton = lightbox.querySelector("[data-lightbox-next]");
    var lastFocused = null;
    var currentIndex = 0;

    var showSlide = function (index) {
      currentIndex = (index + triggers.length) % triggers.length;
      var trigger = triggers[currentIndex];
      var thumb = trigger.querySelector("img");

      lightboxImage.src = thumb ? thumb.currentSrc || thumb.src : "";
      lightboxImage.alt = thumb ? thumb.alt : "";
      if (thumb && thumb.naturalWidth) {
        lightboxImage.width = thumb.naturalWidth;
        lightboxImage.height = thumb.naturalHeight;
      }

      if (lightboxCaption) {
        lightboxCaption.textContent =
          trigger.getAttribute("data-caption") || (thumb ? thumb.alt : "");
      }
      if (lightboxCounter) {
        lightboxCounter.textContent =
          currentIndex + 1 + " / " + triggers.length;
      }
    };

    var openLightbox = function (index) {
      lastFocused = document.activeElement;
      showSlide(index);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      if (closeButton) closeButton.focus();
    };

    var closeLightbox = function () {
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(currentIndex + 1);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(currentIndex - 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(currentIndex + 1);
        return;
      }

      if (event.key === "Tab") {
        var focusable = [closeButton, prevButton, nextButton].filter(Boolean);
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* -----------------------------------------------------------------------
     Contact form (Formspree)
     ----------------------------------------------------------------------- */

  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");

  if (form) {
    var submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      var action = form.getAttribute("action") || "";

      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        event.preventDefault();
        setStatus(
          statusEl,
          "This form is not connected yet. Replace YOUR_FORM_ID in index.html, or email me directly.",
          "error"
        );
        return;
      }

      if (!window.fetch) return;

      event.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add("is-loading");
      }
      setStatus(statusEl, "Sending your message…", "");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus(
              statusEl,
              "Message sent. Thank you — I'll get back to you soon.",
              "success"
            );
            return null;
          }

          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              var message =
                data && data.errors && data.errors.length
                  ? data.errors
                      .map(function (error) {
                        return error.message;
                      })
                      .join(" ")
                  : "Something went wrong. Please try again, or email me directly.";
              setStatus(statusEl, message, "error");
            });
        })
        .catch(function () {
          setStatus(
            statusEl,
            "Network error. Please try again, or email me directly.",
            "error"
          );
        })
        .then(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove("is-loading");
          }
        });
    });
  }
})();
