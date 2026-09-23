/* ==========================================================
   wavelink motion
   Load this at the very end of <body>, after script.js:
   <script src="motion.js"></script>
   ========================================================== */

// Everything is wrapped in a function so its names can't clash with your other scripts.
(function () {
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------------- header: folds into the wave as it scrolls away ---------------- */

  const header = document.querySelector("header");

  if (header && header.querySelector(".brand")) {
    // As soon as you scroll at all, play the fold. Back at the very top, play it in reverse.
    const updateHeader = () => {
      header.classList.toggle("is-condensed", window.scrollY > 2);
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  /* ---------------- splash ---------------- */

  const splash = document.getElementById("splash");

  // The splash plays once when the app is opened. Moving between pages skips it.
  // sessionStorage forgets everything when the tab is closed, so a fresh visit plays it again.
  const alreadyPlayed = sessionStorage.getItem("wl-splash-played") === "1";

  if (splash && alreadyPlayed) {
    splash.remove();
  } else if (splash) {
    sessionStorage.setItem("wl-splash-played", "1");
    const word = splash.querySelector(".splash-word");
    const brand = document.querySelector(".brand");
    document.body.classList.add("is-splashing");

    // Swap this for your real loading, e.g. fetching the weather:
    //   const dataReady = fetch("...").then((r) => r.json());
    const dataReady = new Promise((resolve) => setTimeout(resolve, 2600));

    // The rise and the first swell take about 1.9s to play through
    const introDone = new Promise((resolve) =>
      setTimeout(resolve, reduceMotion ? 0 : 1900),
    );

    let loaded = false;
    dataReady.then(() => {
      loaded = true;
    });

    introDone.then(() => {
      if (loaded) return dock(); // loaded quickly: go straight to the header
      splash.classList.add("is-loading"); // still loading: keep the swell rolling
      dataReady.then(dock);
    });

    let finished = false;

    function dock() {
      if (reduceMotion) return finish();

      // Measure where the splash word is, and where the header word is,
      // then move and shrink the splash word onto it.
      const from = word.getBoundingClientRect();
      const to = brand.getBoundingClientRect();
      const scale = to.width / from.width;

      splash.classList.remove("is-loading");
      splash.classList.add("is-docking");
      word.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`;

      word.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 1200); // safety net in case transitionend never fires
    }

    function finish() {
      if (finished) return;
      finished = true;
      document.body.classList.remove("is-splashing");
      splash.remove();
    }
  }
})();
