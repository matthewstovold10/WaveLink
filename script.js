const sheet = document.getElementById("check-in-sheet");
const openBtn = document.querySelector(".check-in-button");
const confirmBtn = document.querySelector(".btn-primary");
const closeBtn = document.getElementById("sheet-close");

function openSheet() {
  sheet.showModal();
  document.body.classList.add("sheet-open");
}

function closeSheet() {
  sheet.close();
}

openBtn.addEventListener("click", () => {
  sheet.showModal();
  document.body.classList.add("sheet-open");
  closeBtn.addEventListener("click", closeSheet);
});

sheet.addEventListener("close", () => {
  document.body.classList.remove("sheet-open");
});

sheet.addEventListener("click", (e) => {
  if (e.target === sheet) closeSheet();
});

confirmBtn.addEventListener("click", () => {
  const activity = document.querySelector(
    'input[name="ci-activity"]:checked',
  ).value;
  const until = document.querySelector('input[name="until"]:checked').value;
  const visibility = document.querySelector(
    'input[name="visibility"]:checked',
  ).value;

  console.log(
    "Checked in:",
    activity,
    "until",
    until,
    "visible to",
    visibility,
  );

  sheet.close();
  checkIn(activity, until);
});

const timeEl = document.getElementById("until-time");
const noteEl = document.getElementById("until-note");

function updateUntil(value) {
  if (value === "open") {
    timeEl.textContent = "Open";
    noteEl.textContent = "until you leave";
    return;
  }

  const hours = Number(value);
  const end = new Date(Date.now() + hours * 60 * 60 * 1000);

  end.setMinutes(Math.ceil(end.getMinutes() / 15) * 15, 0, 0);

  timeEl.textContent = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  noteEl.textContent = `about ${hours} ${hours === 1 ? "hr" : "hrs"}`;
}

document.querySelectorAll('input[name="until"]').forEach((radio) => {
  radio.addEventListener("change", () => updateUntil(radio.value));
});

updateUntil("4");

const doneSheet = document.getElementById("done-sheet");
const doneSub = document.getElementById("done-sub");
const doneClose = document.getElementById("done-close");
const banner = document.getElementById("checked-banner");
const bannerSub = document.getElementById("checked-sub");
const checkOutBtn = document.getElementById("check-out-button");

const ACTIVITY_NAMES = {
  wing: "wingfoiling",
  surf: "surfing",
  kite: "kitesurfing",
  sup: "paddleboarding",
  kayak: "kayaking",
};

const CHECKIN_KEY = "wl-checkin";

const SPOT_NAMES = {
  beadnell: "Beadnell Bay",
  budle: "Budle Bay",
  seaburn: "Seaburn",
};

const PAGE_SPOT_KEY = document.body.dataset.spot || "beadnell";
const PAGE_SPOT_NAME = SPOT_NAMES[PAGE_SPOT_KEY] || "this spot";

function checkIn(activity, until) {
  const name = ACTIVITY_NAMES[activity];
  const when = until === "open" ? "" : ` until ${timeEl.textContent}`;

  let endsAt = null;
  if (until !== "open") {
    const end = new Date(Date.now() + Number(until) * 60 * 60 * 1000);
    end.setMinutes(Math.ceil(end.getMinutes() / 15) * 15, 0, 0);
    endsAt = end.getTime();
  }

  const record = {
    spotKey: PAGE_SPOT_KEY,
    spotName: PAGE_SPOT_NAME,
    activity: activity,
    label: name[0].toUpperCase() + name.slice(1) + (when ? " ·" + when : ""),
    endsAt: endsAt,
  };

  localStorage.setItem(CHECKIN_KEY, JSON.stringify(record));

  if (doneSheet && doneSub) {
    doneSub.textContent = `${PAGE_SPOT_NAME} · ${name}${when}`;
    doneSheet.showModal();
    document.body.classList.add("sheet-open");
  }

  showBanner(record);
}

function checkOut() {
  localStorage.removeItem(CHECKIN_KEY);
  if (banner) banner.hidden = true;
}

function showBanner(record) {
  if (!banner) return;

  const title = banner.querySelector(".checked-title");
  if (title) title.textContent = `You're at ${record.spotName}`;
  if (bannerSub) bannerSub.textContent = record.label;

  banner.hidden = false;
}

function loadCheckIn() {
  const raw = localStorage.getItem(CHECKIN_KEY);
  if (!raw) return null;

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    localStorage.removeItem(CHECKIN_KEY);
    return null;
  }

  if (record.endsAt && Date.now() > record.endsAt) {
    localStorage.removeItem(CHECKIN_KEY);
    return null;
  }

  return record;
}

const saved = loadCheckIn();
if (saved) showBanner(saved);

doneClose.addEventListener("click", () => doneSheet.close());
doneSheet.addEventListener("close", () =>
  document.body.classList.remove("sheet-open"),
);
checkOutBtn.addEventListener("click", checkOut);

let photoFile = null;

function setupPhotoPicker(buttonId, inputId) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!button || !input) return;

  button.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");

    if (file.size > 30 * 1024 * 1024) {
      alert("That file is a bit large. Try a shorter video.");
      input.value = "";
      return;
    }

    photoFile = file;
    console.log(
      isVideo ? "Video" : "Photo",
      file.name,
      Math.round(file.size / 1024) + " kB",
    );

    document.querySelector(".photo-preview")?.remove();

    const preview = document.createElement(isVideo ? "video" : "img");
    preview.className = "photo-preview";
    preview.src = URL.createObjectURL(file);

    if (isVideo) {
      preview.muted = true;
      preview.playsInline = true;
      preview.autoplay = true;
      preview.loop = true;
    } else {
      preview.alt = "Your photo";
    }

    button.after(preview);
  });
}

setupPhotoPicker("photo-button", "photo-input");
setupPhotoPicker("report-photo-button", "report-photo-input");
setupPhotoPicker("photo-button-site", "photo-input-site");

const SPOTS = {
  beadnell: {
    wind: 23,
    gust: 27,
    dir: "SE",
    wave: 0.7,
    period: 6,
    swell: "SE",
    tide: "Rising",
    water: 14,
  },
  budle: {
    wind: 13,
    gust: 17,
    dir: "SE",
    wave: 0.4,
    period: 4,
    swell: "SE",
    tide: "Rising",
    water: 14,
  },
  seaburn: {
    wind: 18,
    gust: 22,
    dir: "SE",
    wave: 0.3,
    period: 5,
    swell: "SE",
    tide: "Rising",
    water: 14,
  },
};

const ACTIVITIES = {
  wing: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Gusts",
      secValue: s.gust,
    }),
    metrics: (s) => [
      ["Wave", s.wave + " m"],
      ["Period", s.period + " s"],
      ["Tide", s.tide],
      ["Water", s.water + "°"],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Gusts", s.gust],
      ["Wave", s.wave + "m"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind >= 18
        ? ["Good", "good"]
        : s.wind >= 12
          ? ["Light", "moderate"]
          : ["Too light", "poor"],
  },

  surf: {
    hero: (s) => ({
      value: s.wave,
      unit: "m",
      dir: s.swell,
      secLabel: "Period",
      secValue: s.period + " s",
    }),
    metrics: (s) => [
      ["Swell", s.swell],
      ["Wind", s.wind + " " + s.dir],
      ["Tide", s.tide],
      ["Water", s.water + "°"],
    ],
    fav: (s) => [
      ["Wave", s.wave + "m"],
      ["Period", s.period + "s"],
      ["Wind", s.wind + " " + s.dir],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wave >= 1
        ? ["Good", "good"]
        : s.wave >= 0.5
          ? ["Small", "moderate"]
          : ["Flat", "poor"],
  },

  kite: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Gusts",
      secValue: s.gust,
    }),
    metrics: (s) => [
      ["Wave", s.wave + " m"],
      ["Period", s.period + " s"],
      ["Tide", s.tide],
      ["Water", s.water + "°"],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Gusts", s.gust],
      ["Wave", s.wave + "m"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind >= 16
        ? ["Good", "good"]
        : s.wind >= 11
          ? ["Light", "moderate"]
          : ["Too light", "poor"],
  },

  sup: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Wave",
      secValue: s.wave + " m",
    }),
    metrics: (s) => [
      ["Wave", s.wave + " m"],
      ["Tide", s.tide],
      ["Water", s.water + "°"],
      ["Gusts", s.gust + " mph"],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Wave", s.wave + "m"],
      ["Water", s.water + "°"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind <= 12
        ? ["Good", "good"]
        : s.wind <= 18
          ? ["Breezy", "moderate"]
          : ["Too windy", "poor"],
  },

  kayak: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Swell",
      secValue: s.wave + " m",
    }),
    metrics: (s) => [
      ["Swell", s.wave + " m"],
      ["Tide", s.tide],
      ["Water", s.water + "°"],
      ["Gusts", s.gust + " mph"],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Swell", s.wave + "m"],
      ["Water", s.water + "°"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind <= 14
        ? ["Good", "good"]
        : s.wind <= 20
          ? ["Lively", "moderate"]
          : ["Exposed", "poor"],
  },
};

function showActivity(activity) {
  const plan = ACTIVITIES[activity];

  const near = SPOTS.beadnell;
  const h = plan.hero(near);

  document.getElementById("hero-value").textContent = h.value;
  document.getElementById("hero-unit").textContent = h.unit;
  document.getElementById("hero-dir").textContent = h.dir;
  document.getElementById("hero-sec-label").textContent = h.secLabel;
  document.getElementById("hero-sec-value").textContent = h.secValue;

  const heroMetrics = document.querySelectorAll(".hero-metrics .hero-metric");
  plan.metrics(near).forEach(([label, value], i) => {
    heroMetrics[i].querySelector(".spot-label").textContent = label;
    heroMetrics[i].querySelector(".spot-value").textContent = value;
  });

  document.querySelectorAll(".favourite-tile").forEach((card) => {
    const key = card.dataset.spot.split(" ")[0];
    const spot = SPOTS[key];
    if (!spot) return;

    const cells = card.querySelectorAll(".fav-metric");
    plan.fav(spot).forEach(([label, value], i) => {
      cells[i].querySelector(".spot-label").textContent = label;
      cells[i].querySelector(".spot-value").textContent = value;
    });

    const [text, kind] = plan.verdict(spot);
    const chip = card.querySelector(".spot-verdict");
    chip.textContent = text;
    chip.className = "spot-verdict verdict--" + kind;
  });
}

document.querySelectorAll('input[name="activity"]').forEach((radio) => {
  radio.addEventListener("change", () => showActivity(radio.value));
});

showActivity("wing");
