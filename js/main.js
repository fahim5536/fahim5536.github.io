/* ==========================================================================
   Tamzid Abdur Rahman — site interactions
   Navigation, scroll reveal, GitHub projects, gallery lightbox, contact form
   and footer year. No dependencies. Loaded with `defer`.
   ========================================================================== */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var supportsObserver = "IntersectionObserver" in window;
  var CRAWLER_UA = /Googlebot|Google-InspectionTool|Storebot-Google|Bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebookexternalhit|Twitterbot|LinkedInBot|Pinterestbot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|rogerbot|ia_archiver/i;
  var isCrawler = CRAWLER_UA.test(navigator.userAgent || "");

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
        link.setAttribute("aria-current", "page");
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
    if (!reducedMotion.matches && !isCrawler) {
      document.documentElement.classList.add("reveal-ready");
    }

    revealItems.forEach(function (item) {
      var delay = parseInt(item.getAttribute("data-delay") || "0", 10);
      if (delay > 0) item.style.transitionDelay = delay + "ms";
    });

    if (supportsObserver && !reducedMotion.matches && !isCrawler) {
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

    var preloadNeighbours = function (index) {
      [index - 1, index + 1].forEach(function (offset) {
        var neighbour = triggers[(offset + triggers.length) % triggers.length];
        var image = neighbour && neighbour.querySelector("img");
        if (!image) return;
        var cache = new Image();
        cache.src = image.currentSrc || image.src;
      });
    };

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

      preloadNeighbours(currentIndex);
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
     GitHub projects
     Repos and activity come from the public GitHub API and are rendered with
     textContent only. Responses are cached for 30 minutes to stay well inside
     the unauthenticated rate limit.
     ----------------------------------------------------------------------- */

  var GH_USER = "fahim5536";
  var GH_API = "https://api.github.com/users/" + GH_USER;
  var GH_REPOS_URL = GH_API + "/repos?per_page=100&sort=pushed";
  var GH_CACHE_KEY = "tar.github.v1";
  var GH_CACHE_TTL = 30 * 60 * 1000;
  var GH_RECENT_DAYS = 30;
  var GH_MAX_CARDS = 6;

  var projectsGrid = document.getElementById("projects-grid");
  var projectsStatus = document.getElementById("projects-status");
  var activityPanel = document.getElementById("github-activity");
  var projectsFooter = document.querySelector(".projects-footer");

  function announce(message) {
    if (projectsStatus) projectsStatus.textContent = message;
  }

  function setNote(message) {
    if (!projectsFooter) return;
    var note = projectsFooter.querySelector(".projects-note");

    if (!message) {
      if (note) note.remove();
      return;
    }

    if (!note) {
      note = make("p", "projects-note");
      projectsFooter.appendChild(note);
    }
    note.textContent = message;
  }

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function icon(paths, fill, size) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size || 14));
    svg.setAttribute("height", String(size || 14));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    if (fill) {
      svg.setAttribute("fill", "currentColor");
    } else {
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
    }

    paths.forEach(function (d) {
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });

    return svg;
  }

  function daysSince(value) {
    var time = Date.parse(value);
    if (!time) return null;
    var days = Math.floor((Date.now() - time) / 86400000);
    return days < 0 ? 0 : days;
  }

  function relativeUpdated(value) {
    var days = daysSince(value);
    if (days === null) return "Updated recently";
    if (days === 0) return "Updated today";
    if (days === 1) return "Updated yesterday";
    return "Updated " + days + " days ago";
  }

  function prettify(name) {
    var words = String(name || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    var label = words
      .filter(function (word) {
        return word.length > 0;
      })
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");

    return label || "Untitled project";
  }

  function countLabel(value) {
    return typeof value === "number" && isFinite(value)
      ? value.toLocaleString("en-US")
      : "0";
  }

  function safeUrl(value, host) {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
      var url = new URL(value.trim(), "https://github.com/");
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      if (
        host &&
        url.hostname !== host &&
        url.hostname.slice(-(host.length + 1)) !== "." + host
      ) {
        return "";
      }
      return url.href;
    } catch (error) {
      return "";
    }
  }

  function readCache() {
    try {
      var raw = window.localStorage.getItem(GH_CACHE_KEY);
      if (!raw) return null;

      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.repos) || typeof data.savedAt !== "number") {
        return null;
      }
      return data;
    } catch (error) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      window.localStorage.setItem(GH_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      /* Storage can be full or disabled — the page still works without it. */
    }
  }

  function normalizeRepos(list) {
    if (!Array.isArray(list)) return [];

    return list
      .filter(function (repo) {
        return (
          repo &&
          typeof repo.name === "string" &&
          !repo.fork &&
          !repo.archived &&
          repo.name !== "fahim5536.github.io"
        );
      })
      .map(function (repo) {
        var topics = Array.isArray(repo.topics)
          ? repo.topics
              .filter(function (topic) {
                return typeof topic === "string" && topic.length > 0;
              })
              .slice(0, 6)
          : [];

        return {
          name: repo.name.slice(0, 100),
          description:
            typeof repo.description === "string"
              ? repo.description.trim().slice(0, 300)
              : "",
          language:
            typeof repo.language === "string" ? repo.language.slice(0, 40) : "",
          topics: topics,
          stars:
            typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
          pushed: typeof repo.pushed_at === "string" ? repo.pushed_at : "",
          url: typeof repo.html_url === "string" ? repo.html_url : "",
          homepage: typeof repo.homepage === "string" ? repo.homepage.trim() : ""
        };
      })
      .sort(function (a, b) {
        return (Date.parse(b.pushed) || 0) - (Date.parse(a.pushed) || 0);
      });
  }

  function pickUser(user) {
    if (!user || typeof user !== "object") return null;
    return {
      public_repos:
        typeof user.public_repos === "number" ? user.public_repos : null,
      followers: typeof user.followers === "number" ? user.followers : null
    };
  }

  function topLanguages(repos, limit) {
    var stats = {};

    repos.forEach(function (repo) {
      if (!repo.language) return;

      if (!stats[repo.language]) {
        stats[repo.language] = { language: repo.language, count: 0, latest: 0 };
      }

      stats[repo.language].count += 1;
      stats[repo.language].latest = Math.max(
        stats[repo.language].latest,
        Date.parse(repo.pushed) || 0
      );
    });

    return Object.keys(stats)
      .map(function (key) {
        return stats[key];
      })
      .sort(function (a, b) {
        return b.count - a.count || b.latest - a.latest;
      })
      .slice(0, limit);
  }

  function renderActivity(user, repos) {
    if (!activityPanel) return;

    var repoCount = document.getElementById("gh-repo-count");
    var followerCount = document.getElementById("gh-followers");
    var languagesEl = document.getElementById("gh-languages");

    if (repoCount) {
      var total =
        user && typeof user.public_repos === "number"
          ? user.public_repos
          : repos.length;
      repoCount.textContent = countLabel(total);
    }

    if (followerCount) {
      followerCount.textContent =
        user && typeof user.followers === "number"
          ? countLabel(user.followers)
          : "—";
    }

    if (languagesEl) {
      languagesEl.textContent = "";

      var languages = topLanguages(repos, 3);
      if (!languages.length) {
        languagesEl.appendChild(make("span", "activity-language", "—"));
      }

      languages.forEach(function (entry) {
        var chip = make("span", "activity-language");
        chip.appendChild(make("span", null, entry.language));
        chip.appendChild(make("strong", null, String(entry.count)));
        languagesEl.appendChild(chip);
      });
    }

    activityPanel.hidden = false;
  }

  function buildCard(repo, index) {
    var name = prettify(repo.name);
    var repoUrl =
      safeUrl(repo.url, "github.com") ||
      "https://github.com/" + GH_USER + "/" + encodeURIComponent(repo.name);
    var days = daysSince(repo.pushed);

    var card = make("article", "project-card is-dynamic");
    card.style.setProperty("--i", String(index));

    var media = make("div", "project-media project-media-monogram");
    var hash = 0;
    for (var i = 0; i < repo.name.length; i++) {
      hash += repo.name.charCodeAt(i);
    }
    media.classList.add("is-" + ["a", "b", "c"][hash % 3]);
    media.setAttribute("aria-hidden", "true");

    var initials = name
      .split(" ")
      .slice(0, 2)
      .map(function (word) {
        return word.charAt(0);
      })
      .join("");

    media.appendChild(make("span", "project-monogram", initials.toUpperCase() || "GH"));
    if (repo.language) {
      media.appendChild(make("span", "project-media-language", repo.language));
    }

    var body = make("div", "project-body");

    var heading = make("div", "project-heading");
    heading.appendChild(make("h3", null, name));
    if (days !== null && days <= GH_RECENT_DAYS) {
      heading.appendChild(make("span", "project-badge", "Recently active"));
    }
    body.appendChild(heading);

    body.appendChild(
      make(
        "p",
        "project-description",
        repo.description || "Recent project on GitHub"
      )
    );

    var meta = make("div", "project-meta");

    var language = make("span", "project-meta-item");
    var dot = make("span", "project-lang-dot");
    dot.setAttribute("aria-hidden", "true");
    language.appendChild(dot);
    language.appendChild(make("span", null, repo.language || "Code"));
    meta.appendChild(language);

    var stars = make("span", "project-meta-item");
    stars.appendChild(
      icon(
        [
          "m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.75-5.2-2.8-5.2 2.8 1-5.75-4.2-4.1 5.8-.85 2.6-5.3Z"
        ],
        true,
        13
      )
    );
    stars.appendChild(
      make(
        "span",
        null,
        countLabel(repo.stars) + (repo.stars === 1 ? " star" : " stars")
      )
    );
    meta.appendChild(stars);

    meta.appendChild(
      make("span", "project-meta-item project-updated", relativeUpdated(repo.pushed))
    );
    body.appendChild(meta);

    if (repo.topics.length) {
      var tags = make("ul", "tags tags-sm project-tags");
      tags.setAttribute("aria-label", "Topics");

      repo.topics.slice(0, 4).forEach(function (topic) {
        tags.appendChild(make("li", null, topic));
      });

      if (repo.topics.length > 4) {
        tags.appendChild(
          make("li", "tag-more", "+" + (repo.topics.length - 4))
        );
      }

      body.appendChild(tags);
    }

    var actions = make("div", "project-actions");

    var repoLink = make("a", "btn btn-sm btn-outline", "View on GitHub");
    repoLink.href = repoUrl;
    repoLink.target = "_blank";
    repoLink.rel = "noopener noreferrer";
    actions.appendChild(repoLink);

    var demoUrl = safeUrl(repo.homepage);
    if (demoUrl && demoUrl !== repoUrl) {
      var demoLink = make("a", "btn btn-sm btn-primary", "Live Demo");
      demoLink.href = demoUrl;
      demoLink.target = "_blank";
      demoLink.rel = "noopener noreferrer";
      actions.appendChild(demoLink);
    }

    body.appendChild(actions);
    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function renderSkeletons() {
    if (!projectsGrid) return;

    projectsGrid.textContent = "";

    for (var i = 0; i < GH_MAX_CARDS; i++) {
      var card = make("article", "project-card project-skeleton");
      card.setAttribute("aria-hidden", "true");

      var body = make("div", "project-body");
      body.appendChild(make("div", "skeleton-line skeleton-title"));
      body.appendChild(make("div", "skeleton-line"));
      body.appendChild(make("div", "skeleton-line skeleton-short"));

      var actions = make("div", "skeleton-actions");
      actions.appendChild(make("span", null));
      actions.appendChild(make("span", null));
      body.appendChild(actions);

      card.appendChild(make("div", "skeleton-media"));
      card.appendChild(body);
      projectsGrid.appendChild(card);
    }

    projectsGrid.setAttribute("aria-busy", "true");
  }

  function showMessage(message) {
    if (!projectsGrid) return;

    projectsGrid.textContent = "";
    projectsGrid.setAttribute("aria-busy", "false");

    var box = make("div", "projects-fallback");
    box.appendChild(make("p", null, message));

    var link = make("a", "btn btn-outline", "Open GitHub profile");
    link.href = "https://github.com/" + GH_USER;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(link);

    projectsGrid.appendChild(box);
    announce(message);
  }

  function hydrate(cache) {
    if (!projectsGrid) return;

    projectsGrid.textContent = "";
    projectsGrid.setAttribute("aria-busy", "false");
    renderActivity(cache.user, cache.repos);

    var repos = cache.repos.slice(0, GH_MAX_CARDS);

    if (!repos.length) {
      showMessage(
        "No public repositories yet — new work will appear here as it is published."
      );
      return;
    }

    repos.forEach(function (repo, index) {
      projectsGrid.appendChild(buildCard(repo, index));
    });

    announce("Showing " + repos.length + " recently updated repositories.");
  }

  function fetchJson(url) {
    return fetch(url, {
      credentials: "omit",
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub responded with " + response.status);
      }
      return response.json();
    });
  }

  function loadProjects() {
    if (!projectsGrid) return;

    var cached = readCache();

    if (cached && Date.now() - cached.savedAt < GH_CACHE_TTL) {
      hydrate(cached);
      return;
    }

    if (!window.fetch) {
      if (cached) {
        hydrate(cached);
        setNote("Showing saved GitHub projects — this browser cannot fetch live data.");
      } else {
        showMessage(
          "GitHub projects cannot load in this browser. You can browse the repositories directly instead."
        );
      }
      return;
    }

    renderSkeletons();
    announce("Loading GitHub projects…");

    var reposRequest = fetchJson(GH_REPOS_URL);
    var userRequest = fetchJson(GH_API).catch(function () {
      return null;
    });

    Promise.all([reposRequest, userRequest])
      .then(function (results) {
        var data = {
          savedAt: Date.now(),
          user: pickUser(results[1]),
          repos: normalizeRepos(results[0])
        };

        writeCache(data);
        hydrate(data);
        setNote("");
      })
      .catch(function () {
        if (cached) {
          hydrate(cached);
          setNote("Live GitHub data was unavailable, so saved results are shown.");
        } else {
          showMessage(
            "GitHub projects could not load right now — the API may be rate-limited. Please try again in a few minutes, or browse the repositories directly."
          );
        }
      });
  }

  loadProjects();

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
