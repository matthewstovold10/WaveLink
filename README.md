# WaveLink asset pack

Everything visual from the mockup, as files you can drop into a project. Open **`index.html`** in a browser first — it shows every icon, colour and type style on one page.

```
wavelink-assets/
├── index.html                  contact sheet — open this first
├── css/wavelink-tokens.css     colours, fonts, radii, shadows as CSS variables
├── logo/                       mark, lockup, app icon
└── icons/
    ├── activity/               surf, wing, kite, sup, kayak
    ├── nav/                    home, map, activity, profile
    └── ui/                     26 interface icons
```

---

## Fonts

Two families, both free on Google Fonts.

**Space Grotesk** — every number the user reads as data. Wind speeds, gust figures, wave heights, session durations, the big `23` on the spot screen, times in the forecast strip. Weights used: **500, 600, 700**.

Chosen because its digits are distinctive without being decorative, and because at 58px it holds together with tight negative tracking where most geometric sans faces fall apart.

**Manrope** — everything else. Headings, body copy, labels, buttons, nav. Weights used: **400, 500, 600, 700, 800**.

Chosen because it's neutral enough to disappear at 11px but has real character in the heavy weights, and its metrics sit close enough to Space Grotesk that the two mix inside a single line without looking spliced.

### Loading them

One line, already at the top of `wavelink-tokens.css`:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

Then:

```css
font-family: var(--wl-font-ui);       /* Manrope */
font-family: var(--wl-font-figures);  /* Space Grotesk */
```

If you'd rather self-host (faster, works offline, no third-party request), download both from fonts.google.com, convert to `.woff2`, and swap the `@import` for `@font-face` rules.

### The sizes that matter

| Where | Family | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero conditions number | Space Grotesk | 58px | 600 | −2.5px |
| Stat figures (42, 86) | Space Grotesk | 27px | 600 | −1px |
| Card metric values | Space Grotesk | 15–19px | 600 | −0.3 to −0.5px |
| Screen title | Manrope | 24px | 800 | −0.7px |
| Section heading | Manrope | 16px | 800 | −0.3px |
| Spot name on a card | Manrope | 15px | 800 | −0.2px |
| Body / report text | Manrope | 13.5px | 400 | line-height 1.45 |
| Caption, metadata | Manrope | 11px | 600 | — |
| Metric label (caps) | Manrope | 8.5px | 700 | 0.07em |
| Nav tab label | Manrope | 10px | 700 | — |

---

## Icons

All 24×24 on a `0 0 24 24` viewBox, stroke-based, `stroke="currentColor"`. Set `color` on the parent and the icon follows — no need for separate colour variants.

Two exceptions take `fill` rather than `stroke`: `star-filled.svg` and `status-dot.svg`.

### Inlining them

Paste the `<svg>` straight into your HTML. This is the only way `currentColor` works, and it's what the mockup does:

```html
<button class="nav-tab is-active">
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linejoin="round" aria-hidden="true">
    <path d="M3.5 10.6 12 3.6l8.5 7v9a1.4 1.4 0 0 1-1.4 1.4H4.9a1.4 1.4 0 0 1-1.4-1.4Z"/>
  </svg>
  Home
</button>
```

As an `<img src="icons/nav/home.svg">` it'll render black and ignore `color`. Fine for the logo, wrong for icons.

Always set `aria-hidden="true"` when the icon sits next to a text label, and give icon-only buttons an `aria-label`.

### Sizes used in the mockup

19px inside activity pills · 21px in the bottom nav · 13–17px inline beside text · 11px for the wind arrow on dense cards.

### The wind arrow

`ui/wind-arrow.svg` points north. Rotate it to the compass bearing:

```css
transform: rotate(135deg);  /* SE */
```

N 0° · NE 45° · E 90° · SE 135° · S 180° · SW 225° · W 270° · NW 315°

---

## Condition indicators

Four states, as a coloured dot plus a word — never colour alone, since roughly 1 in 12 men can't separate the green from the amber.

| State | Dot | Tint behind text |
|---|---|---|
| Good | `--wl-good` #0B7A53 | `--wl-good-bg` #E6F4EE |
| Moderate | `--wl-moderate` #9A5B00 | `--wl-moderate-bg` #FBF0DE |
| Poor | `--wl-poor` #C0392B | `--wl-poor-bg` #FBEAE7 |
| No data | `--wl-nodata` #94A3B8 | `--wl-nodata-bg` #EDF1F6 |

The three signal colours are deliberately darker than a typical traffic-light palette — they're used as text on white, and the brighter versions fail contrast at small sizes.

---

## Avatars

The mockup uses initial monograms on eight background colours (`--wl-av-1` through `--wl-av-8`), not photographs. White text passes contrast on all eight.

Hash the user's name to pick an index so a given person always gets the same colour:

```js
const i = [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 8;
```

When you add real profile photos, keep the monogram as the fallback for users who haven't uploaded one.

---

## What's not in here

**No photographs.** The images in the spot reports and the chat are SVG illustrations I drew — flat sea-and-sky shapes standing in for user-uploaded photos. They're intentionally placeholders, not something to ship. Real reports will carry real photos from real phones.

**No map tiles.** The maps are hand-drawn SVG coastline. For a working app you'd use Mapbox, MapLibre or Leaflet with OpenStreetMap tiles, then style them toward `--wl-sea`, `--wl-land` and `--wl-road` so it matches.

**No raster exports.** Everything is SVG, which scales to any size and stays sharp. If you need PNGs — for an app icon, a store listing, a favicon — open the SVG in Figma, Inkscape or Squoosh and export at the size you need. `logo/wavelink-app-icon.svg` is already sized at 1024×1024, which is what the App Store asks for.
