(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  // Header solid state on scroll
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav toggle
  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }
  function openNav() {
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }
  navToggle.addEventListener("click", function () {
    var isOpen = nav.classList.contains("is-open");
    if (isOpen) { closeNav(); } else { openNav(); }
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { closeNav(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); }
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Hero image rotation (intro flash through highlights, then settle on the anchor image)
  var heroMedia = document.getElementById("hero-media");
  if (heroMedia) {
    var slides = heroMedia.querySelectorAll(".hero__slide");
    var pauseBtn = document.querySelector(".hero__pause");
    var dots = document.querySelectorAll(".hero__dot");
    var eyebrow = document.getElementById("hero-eyebrow");
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (slides.length > 1 && !prefersReducedMotion) {
      var current = 0;
      var timer = null;

      var setEyebrow = function (text) {
        if (!eyebrow || !text || eyebrow.textContent === text) { return; }
        eyebrow.classList.add("is-fading");
        window.setTimeout(function () {
          eyebrow.innerHTML = text;
          eyebrow.classList.remove("is-fading");
        }, 220);
      };

      var showSlide = function (index) {
        slides[current].classList.remove("is-active");
        if (dots[current]) { dots[current].classList.remove("is-active"); }
        current = index;
        slides[current].classList.add("is-active");
        if (dots[current]) { dots[current].classList.add("is-active"); }
        setEyebrow(slides[current].getAttribute("data-eyebrow"));
      };

      var isThai = document.documentElement.lang === "th";
      var pauseLabel = isThai ? "หยุดการเปลี่ยนภาพ" : "Pause image rotation";
      var playLabel = isThai ? "เล่นการเปลี่ยนภาพ" : "Play image rotation";

      var updatePauseButton = function (isPlaying) {
        if (!pauseBtn) { return; }
        pauseBtn.querySelector(".icon-pause").hidden = !isPlaying;
        pauseBtn.querySelector(".icon-play").hidden = isPlaying;
        pauseBtn.setAttribute("aria-label", isPlaying ? pauseLabel : playLabel);
      };

      var stopTimer = function () {
        clearInterval(timer);
        timer = null;
        updatePauseButton(false);
      };

      var advance = function () {
        var next = (current + 1) % slides.length;
        showSlide(next);
        if (next === 0) { stopTimer(); }
      };

      var startTimer = function () {
        if (timer) { return; }
        timer = setInterval(advance, 4800);
        updatePauseButton(true);
      };

      if (pauseBtn) {
        pauseBtn.addEventListener("click", function () {
          if (timer) { stopTimer(); } else { startTimer(); }
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          stopTimer();
          showSlide(i);
        });
      });

      // Defer fetching the highlight photos until the initial page load is
      // done, so the rotation never competes with the page's own load time.
      var beginRotation = function () {
        slides.forEach(function (slide) {
          var src = slide.getAttribute("data-src");
          if (src) {
            slide.setAttribute("src", src);
            slide.removeAttribute("data-src");
          }
        });
        startTimer();
      };
      if (document.readyState === "complete") {
        beginRotation();
      } else {
        window.addEventListener("load", beginRotation);
      }
    }
  }
})();
