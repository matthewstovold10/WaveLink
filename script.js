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

const SPORT_SHORT = {
  wing: "wing",
  surf: "surf",
  kite: "kite",
  sup: "SUP",
  kayak: "kayak",
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
    air: 15,
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
    air: 15,
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
    air: 15,
  },
};

const SITE_METRICS = {
  wing: (s) => [
    ["Wave", s.wave + " m", "Period", s.period + "s"],
    ["Tide", s.tide, "High 15:42", "4.1 m"],
    ["Temp", "15°/" + s.water + "°", "Air/Water", ""],
  ],

  surf: (s) => [
    ["Swell", s.wave + " m", "Period", s.period + "s"],
    ["Wind", s.wind + " " + s.dir, "Gusts", s.gust + " mph"],
    ["Tide", s.tide, "High 15:42", "4.1 m"],
  ],

  kite: (s) => [
    ["Wave", s.wave + " m", "Period", s.period + "s"],
    ["Tide", s.tide, "High 15:42", "4.1 m"],
    ["Temp", "15°/" + s.water + "°", "Air/Water", ""],
  ],

  sup: (s) => [
    ["Wave", s.wave + " m", "Period", s.period + "s"],
    ["Tide", s.tide, "High 15:42", "4.1 m"],
    ["Gusts", s.gust + " mph", "Wind", s.wind + " " + s.dir],
  ],

  kayak: (s) => [
    ["Swell", s.wave + " m", "Period", s.period + "s"],
    ["Tide", s.tide, "High 15:42", "4.1 m"],
    ["Gusts", s.gust + " mph", "Wind", s.wind + " " + s.dir],
  ],
};

const ACTIVITIES = {
  wing: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Gusts",
      secValue: s.gust + " mph",
    }),
    metrics: (s) => [
      ["Wave", s.wave + " m", "Period " + s.period + "s"],
      ["Tide", s.tide, "High 15:42"],
      ["Air", s.air + "°", "Water " + s.water + "°"],
      ["Sunset", s.sunset || "—", s.lightLeft || ""],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Gusts", s.gust + " mph"],
      ["Wave", s.wave + "m"],
      ["Tide", s.tide],
    ],
    verdict: (s) => {
      const spread = s.gust - s.wind;
      if (s.wind >= 18) {
        return spread >= 12
          ? ["Gusty for wing", "moderate"]
          : ["Good for wing", "good"];
      }

      if (s.wind >= 10) {
        return s.gust >= 25
          ? ["Gusty but rideable for wing", "moderate"]
          : ["Too light for wing", "poor"];
      }

      return ["Too light for wing", "poor"];
    },
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
      ["Wind", s.wind + " " + s.dir, "Gusts " + s.gust],
      ["Tide", s.tide, "High 15:42"],
      ["Air", s.air + "°", "Water " + s.water + "°"],
      ["Sunset", s.sunset || "—", s.lightLeft || ""],
    ],
    fav: (s) => [
      ["Wave", s.wave + "m"],
      ["Period", s.period + "s"],
      ["Wind", s.wind + " " + s.dir],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wave >= 1
        ? ["Good for surf", "good"]
        : s.wave >= 0.5
          ? ["Small for surf", "moderate"]
          : [" Too flat for surf", "poor"],
  },

  kite: {
    hero: (s) => ({
      value: s.wind,
      unit: "mph",
      dir: s.dir,
      secLabel: "Gusts",
      secValue: s.gust + " mph",
    }),
    metrics: (s) => [
      ["Wave", s.wave + " m", "Period " + s.period + "s"],
      ["Tide", s.tide, "High 15:42"],
      ["Air", s.air + "°", "Water " + s.water + "°"],
      ["Sunset", s.sunset || "—", s.lightLeft || ""],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Gusts", s.gust + " mph"],
      ["Wave", s.wave + "m"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind >= 16
        ? ["Good for kite", "good"]
        : s.wind >= 11
          ? ["Light for kite", "moderate"]
          : ["Too light for kite", "poor"],
  },

  sup: {
    hero: (s) => ({
      value: s.wave,
      unit: "m",
      dir: s.dir,
      secLabel: "Wind",
      secValue: s.wind + " mph",
    }),
    metrics: (s) => [
      ["Wind", s.wind + " " + s.dir, "Gusts " + s.gust],
      ["Tide", s.tide, "High 15:42"],
      ["Air", s.air + "°", "Water " + s.water + "°"],
      ["Sunset", s.sunset || "—", s.lightLeft || ""],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Wave", s.wave + "m"],
      ["Temp", s.air + "°", "water " + s.water + "°"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind <= 12
        ? ["Good for SUP", "good"]
        : s.wind <= 18
          ? ["Breezy for SUP", "moderate"]
          : ["Too windy for SUP", "poor"],
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
      ["Temp", s.air + "°", "water " + s.water + "°"],
      ["Gusts", s.gust + " mph"],
    ],
    fav: (s) => [
      ["Wind", s.wind + " " + s.dir],
      ["Swell", s.wave + "m"],
      ["Temp", s.air + "°", "water " + s.water + "°"],
      ["Tide", s.tide],
    ],
    verdict: (s) =>
      s.wind <= 14
        ? ["Good for kayak", "good"]
        : s.wind <= 20
          ? ["Lively for kayak", "moderate"]
          : ["Too exposed for kayak", "poor"],
  },
};

const COMPASS_DEG = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

function arrowSvg(deg) {
  return `<svg class="dir-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    style="transform: rotate(${deg}deg)">
    <path d="M12 20V5" /><path d="m6.2 11 5.8-6 5.8 6" /></svg>`;
}

function setValue(el, value) {
  if (!el) return;

  const text = String(value);
  const dir = text.match(/(?:^|\s)(N|NE|E|SE|S|SW|W|NW)$/);
  const split = text.match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z°]*)$/);

  if (split) {
    el.textContent = split[1];
    if (split[2]) {
      el.insertAdjacentHTML(
        "beforeend",
        `<span class="unit">${split[2]}</span>`,
      );
    }
  } else {
    el.textContent = text;
  }

  if (dir) {
    el.insertAdjacentHTML("beforeend", arrowSvg(COMPASS_DEG[dir[1]]));
  }
}

const ACTIVITY_KEY = "wl-activity";

function showActivity(activity) {
  const plan = ACTIVITIES[activity];
  if (!plan) return;

  localStorage.setItem(ACTIVITY_KEY, activity);

  const near = SPOTS[PAGE_SPOT_KEY] || SPOTS.beadnell;
  const h = plan.hero(near);

  const heroVerdict = document.getElementById("hero-verdict");
  if (heroVerdict) {
    const [vText, vKind] = plan.verdict(near);
    heroVerdict.textContent = vText;
    heroVerdict.className = "spot-verdict verdict--" + vKind;
  }

  const heroValue = document.getElementById("hero-value");
  if (heroValue) {
    heroValue.textContent = h.value;
    document.getElementById("hero-unit").textContent = h.unit;
    document.getElementById("hero-dir").textContent = h.dir;
    const heroArrow = document.getElementById("hero-arrow");
    if (heroArrow) heroArrow.innerHTML = arrowSvg(COMPASS_DEG[h.dir] ?? 0);
    document.getElementById("hero-sec-label").textContent = h.secLabel;
    const secEl = document.getElementById("hero-sec-value");
    if (secEl) {
      const [num, ...rest] = String(h.secValue).split(" ");
      secEl.innerHTML = rest.length
        ? `${num}<span class="hero-gusts-unit">${rest.join(" ")}</span>`
        : num;
    }
  }

  const heroMetrics = document.querySelectorAll(".hero-metrics .hero-metric");
  plan.metrics(near).forEach(([label, value, sub], i) => {
    if (!heroMetrics[i]) return;
    heroMetrics[i].querySelector(".spot-label").textContent = label;
    setValue(heroMetrics[i].querySelector(".spot-value"), value);
    const subEl = heroMetrics[i].querySelector(".spot-sub");
    if (subEl) subEl.textContent = sub || "";
  });

  const siteMetrics = document.querySelectorAll(
    ".hero-metrics-site .hero-metric-site",
  );
  if (siteMetrics.length && SITE_METRICS[activity]) {
    SITE_METRICS[activity](near).forEach(
      ([bigLabel, bigValue, smallLabel, smallValue], i) => {
        const block = siteMetrics[i];
        if (!block) return;
        block.querySelector(".spot-label").textContent = bigLabel;
        setValue(block.querySelector(".spot-value"), bigValue);
        block.querySelector(".spot-label-site").textContent = smallLabel;
        setValue(block.querySelector(".spot-value-site"), smallValue);
      },
    );
  }

  document.querySelectorAll(".favourite-tile").forEach((card) => {
    const spot = SPOTS[card.dataset.spot.split(" ")[0]];
    if (!spot) return;

    const cells = card.querySelectorAll(".fav-metric");
    plan.fav(spot).forEach(([label, value], i) => {
      if (!cells[i]) return;
      cells[i].querySelector(".spot-label").textContent = label;
      setValue(cells[i].querySelector(".spot-value"), value);
    });

    const [text, kind] = plan.verdict(spot);
    const chip = card.querySelector(".spot-verdict");
    if (chip) {
      chip.textContent = text;
      chip.className = "spot-verdict verdict--" + kind;
    }
  });

  const picker = document.querySelector(".sport-picker-site");
  if (picker) {
    const icon = picker.querySelector(".sport-site-icon img");
    const name = picker.querySelector(".sport-site");
    const short = picker.querySelector(".sport-site-description b");
    const select = picker.querySelector("#sport");

    if (icon) icon.src = "assets/icons/activity/" + activity + ".svg";
    if (name) name.textContent = ACTIVITY_NAMES[activity];
    if (short) short.textContent = SPORT_SHORT[activity];
    if (select) select.value = activity;
  }
}

document.querySelectorAll('input[name="activity"]').forEach((radio) => {
  radio.addEventListener("change", () => showActivity(radio.value));
});

const sportSelect = document.getElementById("sport");
if (sportSelect) {
  sportSelect.addEventListener("change", () => showActivity(sportSelect.value));
}

const savedActivity = localStorage.getItem(ACTIVITY_KEY) || "wing";

const savedRadio = document.getElementById(savedActivity);
if (savedRadio && savedRadio.name === "activity") savedRadio.checked = true;

showActivity(savedActivity);

//weather api

function degreesToCompass(deg) {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(deg / 45) % 8];
}

async function loadWind() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=55.5560&longitude=-1.5900" +
    "&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m" +
    "&daily=sunset" +
    "&forecast_days=1&wind_speed_unit=mph&timezone=Europe%2FLondon&cell_selection=sea";

  const marineUrl =
    "https://marine-api.open-meteo.com/v1/marine?latitude=55.5560&longitude=-1.5900" +
    "&current=wave_height,wave_period,sea_surface_temperature" +
    "&timezone=Europe%2FLondon&cell_selection=sea";

  try {
    const [weather, marine] = await Promise.all([
      fetch(url).then((r) => r.json()),
      fetch(marineUrl).then((r) => r.json()),
    ]);

    SPOTS.beadnell.wind = Math.round(weather.current.wind_speed_10m);
    SPOTS.beadnell.gust = Math.round(weather.current.wind_gusts_10m);
    SPOTS.beadnell.dir = degreesToCompass(weather.current.wind_direction_10m);
    SPOTS.beadnell.air = Math.round(weather.current.temperature_2m);

    if (weather.daily && weather.daily.sunset) {
      const setTime = weather.daily.sunset[0];
      SPOTS.beadnell.sunset = setTime.slice(11, 16);

      const hoursLeft = (new Date(setTime) - Date.now()) / 3600000;
      SPOTS.beadnell.lightLeft =
        hoursLeft > 0 ? Math.round(hoursLeft) + " hr light" : "after dark";
    }

    if (marine.current.wave_height != null) {
      SPOTS.beadnell.wave = Number(marine.current.wave_height.toFixed(1));
    }
    if (marine.current.wave_period != null) {
      SPOTS.beadnell.period = Math.round(marine.current.wave_period);
    }
    if (marine.current.sea_surface_temperature != null) {
      SPOTS.beadnell.water = Math.round(marine.current.sea_surface_temperature);
    }

    showActivity(localStorage.getItem(ACTIVITY_KEY) || "wing");
  } catch (err) {
    console.error("Couldn't load conditions:", err);
  }
}

loadWind();

async function loadForecast() {
  const row = document.querySelector(".forecast-days");
  if (!row) return;

  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=55.5560&longitude=-1.5900" +
    "&daily=wind_speed_10m_mean,wind_gusts_10m_mean,wind_direction_10m_dominant" +
    "&forecast_days=7&wind_speed_unit=mph&timezone=Europe%2FLondon&cell_selection=sea";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const d = data.daily;

    row.innerHTML = d.time
      .map((date, i) => {
        const name =
          i === 0
            ? "Today"
            : new Date(date).toLocaleDateString("en-GB", { weekday: "short" });

        return `
          <input type="radio" id="day-${i}" name="day" value="${i}" ${i === 0 ? "checked" : ""} />
          <label for="day-${i}">
            <span class="day-name">${name}</span>
            <span class="day-wind">${Math.round(d.wind_speed_10m_mean[i])}</span>
            <span class="day-dir">${degreesToCompass(d.wind_direction_10m_dominant[i])}</span>
          </label>`;
      })
      .join("");
  } catch (err) {
    console.error("Couldn't load forecast:", err);
  }
}

loadForecast();

let HOURLY = null;

async function loadHours() {
  const row = document.getElementById("hours");
  const strip = document.querySelector(".strip-bars");
  if (!row && !strip) return;

  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=55.5560&longitude=-1.5900" +
    "&hourly=wind_speed_10m,wind_direction_10m" +
    "&forecast_days=7&wind_speed_unit=mph&timezone=Europe%2FLondon&cell_selection=sea";

  try {
    const res = await fetch(url);
    HOURLY = (await res.json()).hourly;
    showHours(0);
    showStrip();
  } catch (err) {
    console.error("Couldn't load hours:", err);
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadWind();
    loadForecast();
    loadHours();
  }
});

function windLevel(mph) {
  if (mph < 8) return 1;
  if (mph < 13) return 2;
  if (mph < 18) return 3;
  if (mph < 25) return 4;
  return 5;
}

function showStrip() {
  const slots = document.querySelectorAll(".bar-slot");
  if (!slots.length || !HOURLY) return;

  const d = HOURLY;
  const now = new Date();
  let start = d.time.findIndex((t) => new Date(t) > now) - 1;
  if (start < 0) start = 0;

  const windowMax = Math.max(
    20,
    ...Array.from(slots, (_, i) =>
      Math.round(d.wind_speed_10m[start + i] || 0),
    ),
  );

  const MIN_H = 6;
  const MAX_H = 44;

  let peak = 0;
  let peakAt = "";

  slots.forEach((slot, i) => {
    const n = start + i;
    const t = d.time[n];
    if (t == null) return;

    const mph = Math.round(d.wind_speed_10m[n]);
    const h = MIN_H + (mph / windowMax) * (MAX_H - MIN_H);

    slot.style.setProperty("--v", h.toFixed(1) + "px");
    slot.dataset.level = windLevel(mph);
    slot.querySelector(".bar-label").textContent =
      i === 0 ? "Now" : t.slice(11, 13);

    if (mph > peak) {
      peak = mph;
      peakAt = t.slice(11, 16);
    }
  });

  const peakEl = document.getElementById("strip-peak");
  if (peakEl) peakEl.textContent = `Peaks ${peak} mph at ${peakAt}`;
}

function showHours(dayIndex) {
  const row = document.getElementById("hours");
  if (!row || !HOURLY) return;

  const d = HOURLY;
  const day = Number(dayIndex);
  const isToday = day === 0;

  let start, count;

  if (isToday) {
    const now = new Date();
    start = d.time.findIndex((t) => new Date(t) > now) - 1;
    if (start < 0) start = 0;
    count = 24 - Number(d.time[start].slice(11, 13));
  } else {
    start = day * 24;
    count = 24;
  }

  const STEP = 2;
  const indexes = [];
  for (let n = start; n < start + count; n += STEP) indexes.push(n);

  row.innerHTML = indexes
    .map((n) => {
      const t = d.time[n];
      if (t == null) return "";

      const hour = Number(t.slice(11, 13));
      const spin = d.wind_direction_10m[n];

      const label = isToday && n === start ? "Now" : t.slice(11, 13);

      const classes =
        "hour" +
        (isToday && n === start ? " is-now" : "") +
        (hour < 7 || hour > 20 ? " is-night" : "");

      return `
        <div class="${classes}">
          <span class="hour-label">${label}</span>
          <span class="hour-wind">${Math.round(d.wind_speed_10m[n])}</span>
          <svg class="hour-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
               style="transform: rotate(${spin}deg)" aria-hidden="true">
            <path d="M12 20V5" /><path d="m6.2 11 5.8-6 5.8 6" />
          </svg>
        </div>`;
    })
    .join("");

  row.scrollLeft = 0;
}

document.querySelector(".forecast-days")?.addEventListener("change", (e) => {
  showHours(e.target.value);
});

loadHours();

const CHART_DATUM = 2.7;

const HOURS_BACK = 3;
const HOURS_FWD = 9;

async function loadTide() {
  if (!document.querySelector(".tide-chart-wrap")) return;

  const url =
    "https://marine-api.open-meteo.com/v1/marine?latitude=55.5560&longitude=-1.5900" +
    "&hourly=sea_level_height_msl&forecast_days=2" +
    "&timezone=Europe%2FLondon&cell_selection=sea";

  try {
    const d = (await fetch(url).then((r) => r.json())).hourly;
    drawTide(d.time, d.sea_level_height_msl);
  } catch (err) {
    console.error("Couldn't load tide:", err);
  }
}

function refine(levels, i) {
  const [a, b, c] = [levels[i - 1], levels[i], levels[i + 1]];
  const denom = a - 2 * b + c;
  if (denom === 0) return { shift: 0, h: b };
  const shift = (a - c) / (2 * denom);
  return { shift, h: b - ((a - c) * shift) / 4 };
}

function drawTide(times, levels) {
  const now = Date.now();
  const nowIdx = times.findIndex((t) => new Date(t) > now) - 1;
  if (nowIdx < 1) return;

  const from = Math.max(1, nowIdx - HOURS_BACK);
  const to = Math.min(times.length - 2, nowIdx + HOURS_FWD);

  const W = 300,
    H = 100,
    PAD = 14;
  const span = to - from;

  const win = levels.slice(from, to + 1);
  const lo = Math.min(...win);
  const hi = Math.max(...win);

  const xFor = (hours) => (W * hours) / span;
  const yFor = (h) => H - PAD - ((h - lo) / (hi - lo)) * (H - PAD * 2);
  const pct = (hours) => Math.min(95, Math.max(5, (hours / span) * 100));

  const pts = win.map((h, i) => [xFor(i), yFor(h)]);

  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    line += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }

  document.getElementById("tide-line").setAttribute("d", line);
  document
    .getElementById("tide-fill")
    .setAttribute("d", `${line} L${W},${H} L0,${H} Z`);

  const nowHours = nowIdx - from + (now - new Date(times[nowIdx])) / 3600000;
  const a = levels[nowIdx];
  const b = levels[nowIdx + 1];
  const nowH = a + (b - a) * (nowHours - (nowIdx - from));

  const nowLeft = (nowHours / span) * 100 + "%";
  const nowTop = (yFor(nowH) / H) * 100 + "%";

  const dot = document.getElementById("tide-dot");
  dot.hidden = false;
  dot.style.left = nowLeft;
  dot.style.top = nowTop;

  const nowLabel = document.getElementById("tide-now-label");
  nowLabel.hidden = false;
  nowLabel.style.left = nowLeft;
  nowLabel.style.top = nowTop;

  const marks = [];
  for (let i = from + 1; i < to; i++) {
    const [p, c, n] = [levels[i - 1], levels[i], levels[i + 1]];
    if ((c > p && c >= n) || (c < p && c <= n)) {
      const { shift, h } = refine(levels, i);
      const at = new Date(new Date(times[i]).getTime() + shift * 3600000);
      marks.push({
        hours: i - from + shift,
        high: c > p,
        at: at.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        h: h + CHART_DATUM,
      });
    }
  }

  const row = document.getElementById("tide-labels");
  row.innerHTML = marks
    .map(
      (m) =>
        `<span class="tide-mark" style="left:${pct(m.hours)}%">${m.high ? "High" : "Low"} ${m.at}</span>`,
    )
    .join("");

  const next = marks[0];
  if (next) {
    const state = next.high ? "Rising" : "Falling";
    document.getElementById("tide-state").textContent = state;
    document.getElementById("tide-next").textContent =
      `${next.high ? "High" : "Low"} ${next.at} ${next.h.toFixed(1)} m`;

    SPOTS[PAGE_SPOT_KEY].tide = state;
  }
}

loadTide();
