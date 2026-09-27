const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
const motionEnabled = !prefersReducedMotion.matches;

document.body.classList.toggle("has-motion", motionEnabled);

const siteCursor = document.querySelector(".site-cursor");

if (siteCursor && canHover.matches) {
  const cursorDot = siteCursor.querySelector(".cursor-dot");
  const cursorRing = siteCursor.querySelector(".cursor-ring");
  const cursorGlyph = siteCursor.querySelector(".cursor-glyph");
  const cursorEmailCharacter = siteCursor.querySelector(".cursor-email-character");
  const interactiveSelector = "a, button, [data-tilt]";
  const darkSelector = ".stories, .contact, .site-footer";
  let cursorX = -64;
  let cursorY = -64;
  let ringX = -64;
  let ringY = -64;
  let cursorFrame;

  document.body.classList.add("has-custom-cursor");

  const renderCursor = () => {
    const easing = motionEnabled ? 0.18 : 1;
    ringX += (cursorX - ringX) * easing;
    ringY += (cursorY - ringY) * easing;
    cursorRing.style.left = `${ringX.toFixed(2)}px`;
    cursorRing.style.top = `${ringY.toFixed(2)}px`;

    if (Math.abs(cursorX - ringX) > 0.1 || Math.abs(cursorY - ringY) > 0.1) {
      cursorFrame = window.requestAnimationFrame(renderCursor);
    } else {
      cursorFrame = undefined;
    }
  };

  const updateCursorContext = (target) => {
    const element = target instanceof Element ? target : null;
    const interactive = element?.closest(interactiveSelector);
    const link = element?.closest("a");
    const story = element?.closest("[data-tilt]");
    const isEmail = Boolean(link?.matches('[href^="mailto:"]'));

    let glyph = "→";

    if (isEmail) {
      glyph = "✉";
    } else if (story) {
      glyph = "VIEW";
    } else if (link) {
      const href = link.getAttribute("href") || "";

      if (href === "#top") {
        glyph = "↑";
      } else if (href.startsWith("#")) {
        const destination = document.querySelector(href);
        const destinationY = destination ? destination.offsetTop : window.scrollY;
        glyph = destinationY < window.scrollY + 120 ? "↑" : "↓";
      } else if (!href.startsWith("mailto:")) {
        glyph = "↗";
      }
    }

    cursorGlyph.textContent = glyph;
    siteCursor.classList.toggle("is-interactive", Boolean(interactive));
    siteCursor.classList.toggle("is-story", Boolean(story));
    siteCursor.classList.toggle("is-email", isEmail);
    siteCursor.classList.toggle("is-on-dark", Boolean(element?.closest(darkSelector)));
  };

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
    cursorGlyph.style.left = `${cursorX}px`;
    cursorGlyph.style.top = `${cursorY}px`;
    cursorEmailCharacter.style.left = `${cursorX}px`;
    cursorEmailCharacter.style.top = `${cursorY}px`;
    siteCursor.classList.add("is-visible");
    updateCursorContext(event.target);

    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
  }, { passive: true });

  const releaseCursor = () => siteCursor.classList.remove("is-pressed");

  window.addEventListener("pointerdown", () => siteCursor.classList.add("is-pressed"), { passive: true });
  window.addEventListener("pointerup", releaseCursor, { passive: true });
  window.addEventListener("pointercancel", releaseCursor, { passive: true });
  window.addEventListener("dragend", releaseCursor, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => siteCursor.classList.remove("is-visible"));
  document.documentElement.addEventListener("mouseenter", () => siteCursor.classList.add("is-visible"));
  window.addEventListener("blur", () => siteCursor.classList.remove("is-visible"));
}

const revealItems = document.querySelectorAll(".reveal");

if (!motionEnabled || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -7%", threshold: 0.06 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const header = document.querySelector("[data-header]");
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];

let scrollFrame;

const updateScrollState = () => {
  const readingLine = window.scrollY + window.innerHeight * 0.36;
  const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = availableScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / availableScroll)) : 0;
  let currentSection = observedSections[0];

  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  header?.classList.toggle("is-scrolled", window.scrollY > 24);

  observedSections.forEach((section) => {
    if (section.offsetTop <= readingLine) currentSection = section;
  });

  sectionLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${currentSection.id}`;
    if (isCurrent) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (motionEnabled) {
    parallaxItems.forEach((item) => {
      const rect = item.parentElement.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      const factor = Number(item.dataset.parallax) || 0;
      const shift = Math.max(-70, Math.min(70, -distanceFromCenter * factor));
      item.style.setProperty("--parallax-y", `${shift.toFixed(2)}px`);
    });
  }

  scrollFrame = undefined;
};

const queueScrollUpdate = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
};

window.addEventListener("scroll", queueScrollUpdate, { passive: true });
window.addEventListener("resize", queueScrollUpdate);
updateScrollState();

if (motionEnabled && canHover.matches) {
  let smoothScrollFrame;
  let smoothScrollTarget = window.scrollY;
  let smoothScrollPosition = window.scrollY;

  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampScroll = (value) => Math.min(maxScroll(), Math.max(0, value));

  const stopSmoothScroll = () => {
    if (smoothScrollFrame) window.cancelAnimationFrame(smoothScrollFrame);
    smoothScrollFrame = undefined;
    smoothScrollTarget = window.scrollY;
    smoothScrollPosition = window.scrollY;
  };

  const renderSmoothScroll = () => {
    const distance = smoothScrollTarget - smoothScrollPosition;
    smoothScrollPosition += distance * 0.12;

    if (Math.abs(distance) < 0.45) {
      smoothScrollPosition = smoothScrollTarget;
      window.scrollTo({ top: smoothScrollTarget, behavior: "instant" });
      smoothScrollFrame = undefined;
      return;
    }

    window.scrollTo({ top: smoothScrollPosition, behavior: "instant" });
    smoothScrollFrame = window.requestAnimationFrame(renderSmoothScroll);
  };

  const hasScrollableParent = (start, deltaY) => {
    let element = start instanceof Element ? start : null;

    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      const canScroll = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;
      const hasRoom = deltaY < 0
        ? element.scrollTop > 0
        : element.scrollTop + element.clientHeight < element.scrollHeight - 1;

      if (canScroll && hasRoom) return true;
      element = element.parentElement;
    }

    return false;
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (hasScrollableParent(event.target, event.deltaY)) return;

      event.preventDefault();

      if (!smoothScrollFrame) {
        smoothScrollTarget = window.scrollY;
        smoothScrollPosition = window.scrollY;
      }

      const deltaScale = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      smoothScrollTarget = clampScroll(smoothScrollTarget + event.deltaY * deltaScale * 0.9);

      if (!smoothScrollFrame) smoothScrollFrame = window.requestAnimationFrame(renderSmoothScroll);
    },
    { passive: false },
  );

  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const hash = link.getAttribute("href");
      const target = hash === "#top" ? document.body : document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      stopSmoothScroll();

      const scrollPadding = Number.parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const start = window.scrollY;
      const destination = hash === "#top"
        ? 0
        : clampScroll(start + target.getBoundingClientRect().top - scrollPadding);
      const distance = destination - start;
      const duration = Math.min(1050, Math.max(600, Math.abs(distance) * 0.32));
      const startedAt = performance.now();

      const animateAnchor = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 5);
        window.scrollTo({ top: start + distance * eased, behavior: "instant" });

        if (progress < 1) {
          smoothScrollFrame = window.requestAnimationFrame(animateAnchor);
        } else {
          smoothScrollFrame = undefined;
          smoothScrollTarget = destination;
          smoothScrollPosition = destination;
          window.history.pushState(null, "", hash);
        }
      };

      smoothScrollFrame = window.requestAnimationFrame(animateAnchor);
    });
  });

  window.addEventListener("keydown", stopSmoothScroll, { passive: true });
  window.addEventListener("pointerdown", stopSmoothScroll, { passive: true });
  window.addEventListener("resize", stopSmoothScroll);
}

if (motionEnabled && canHover.matches) {
  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    let releaseTimer;

    element.addEventListener("pointerenter", () => {
      window.clearTimeout(releaseTimer);
      element.classList.remove("is-releasing");
    });

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const strength = Number(element.dataset.magneticStrength) || 0.16;
      const limit = Number(element.dataset.magneticLimit) || 14;
      const rawX = (event.clientX - rect.left - rect.width / 2) * strength;
      const rawY = (event.clientY - rect.top - rect.height / 2) * strength;
      const x = Math.max(-limit, Math.min(limit, rawX));
      const y = Math.max(-limit, Math.min(limit, rawY));
      element.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    });

    element.addEventListener("pointerleave", () => {
      if (element.hasAttribute("data-smooth-release")) {
        element.classList.add("is-releasing");
        releaseTimer = window.setTimeout(() => {
          element.classList.remove("is-releasing");
        }, 1000);
      }
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const surface = card.querySelector(".story-photo, .story-visual");
    if (!surface) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      surface.style.setProperty("--tilt-x", `${(x * 5).toFixed(2)}deg`);
      surface.style.setProperty("--tilt-y", `${(y * -4).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      surface.style.setProperty("--tilt-x", "0deg");
      surface.style.setProperty("--tilt-y", "0deg");
    });
  });
}
