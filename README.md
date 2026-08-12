# Local Weather

A tiny, dependency-free weather app: current conditions, the next 12 hours, and a 7-day forecast.
No build step, no npm install, no API key.

## Run it

```bash
git clone https://github.com/wswarren12/local-weather.git
cd local-weather
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

You can also just double-click `index.html` — but see [Caveats](#caveats) below.

## Features

- **Auto-detect location** via the browser Geolocation API, with city search as a fallback
- **Current conditions** — temperature, feels-like, humidity, wind, precipitation
- **Next 12 hours** — scrollable hourly strip with icons
- **7-day forecast** — high/low, condition, and max precipitation probability
- **°F / °C toggle** — also swaps wind between mph and km/h
- **Remembers your last location** and unit preference via `localStorage`

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Markup: search bar, current card, hourly strip, 7-day list |
| `style.css` | Dark theme, responsive layout |
| `app.js` | Open-Meteo fetch, WMO code → icon mapping, unit toggle, `localStorage` |
| `README.md` | This file |
| `CLAUDE.md` | Project conventions + architecture opt-out note |
| `LICENSE` | MIT |

## How it works

Two free, keyless [Open-Meteo](https://open-meteo.com) endpoints:

- **Geocoding** — `geocoding-api.open-meteo.com/v1/search` turns a city name into lat/lon
- **Forecast** — `api.open-meteo.com/v1/forecast` returns current, hourly, and daily blocks

Weather conditions come back as [WMO codes](https://open-meteo.com/en/docs), which `app.js` maps
to a label and an emoji via the `WMO` lookup table. Timezone is resolved automatically
(`timezone=auto`) so hourly and daily timestamps are already local to the queried location.

## Caveats

- **Geolocation is blocked over `file://`** in Safari and Chrome, so double-clicking `index.html`
  falls back to an error message. City search still works. Use the local server to get
  auto-location.
- **Error paths are lightly tested.** The happy path was verified against the live Open-Meteo API,
  and `node --check app.js` passes. The failure branches (unknown city, denied location
  permission, network error) are written but were not exercised.
- **Precipitation is always inches**, regardless of the °F/°C toggle.

## License

[MIT](LICENSE) © 2026 William Warren.

## Credits

Weather data from [Open-Meteo](https://open-meteo.com), free for non-commercial use under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

## Development transcript

This app was built in a single session with Claude Code. The full conversation is reproduced
below, unedited, as a record of how it came together.

### 1. Initial request

> **User:** create a folder for a mini app on my desktop that tracks local weather

**Claude** first checked a personal knowledge base (an Obsidian vault of architecture decisions
and stack preferences) rather than immediately scaffolding. That vault defines a hard gate: any
new project must go through Domain Discovery and Core Identification before code is written,
*unless* the user explicitly confirms it's a throwaway spike. Silence does not count as consent.

> **Claude:** Before I scaffold anything, the vault's new-project gate applies.
>
> **Is this a throwaway spike where we should skip the onion gate?** (A "mini app" sounds like it,
> but silence isn't consent.)
>
> If **yes** → I'll create `~/Desktop/local-weather/` as a single-page app (HTML/JS + Open-Meteo,
> no API key, geolocation) and log the opt-out in its `CLAUDE.md`.
>
> If **no** → I'll run Domain Discovery first. Quick question battery:
> 1. Who uses it — just you, or others?
> 2. "Local" = browser geolocation, a saved city list, or a fixed home location?
> 3. What do you actually need to see: current conditions, hourly, 7-day, alerts?
> 4. Any history/tracking over time (logging observations), or read-only display?
> 5. Web or mobile? Does it need to persist anything between visits?
>
> Answer either "yes, spike" or those five, and I'll build.

### 2. Confirmation

> **User:** Yes

With the spike confirmed, Claude created `~/Desktop/local-weather/` and wrote five files:
`index.html`, `style.css`, `app.js`, `CLAUDE.md`, and `README.md`. The `CLAUDE.md` recorded the
opt-out verbatim as **"Onion gate: skipped — throwaway spike."**

Before reporting success, Claude verified the work:

```bash
node --check app.js   # → JS OK
curl -s "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&..."
```

The live API call confirmed the response shape matched what `app.js` reads — `current.*`,
`current_units.wind_speed_10m`, and the `daily.*` arrays.

> **Claude:** Done — `~/Desktop/local-weather/`
>
> | File | Purpose |
> |---|---|
> | `index.html` | Markup: search bar, current card, hourly strip, 7-day list |
> | `style.css` | Dark theme, responsive |
> | `app.js` | Open-Meteo fetch + WMO code→icon mapping, unit toggle, localStorage |
> | `README.md` | How to run |
> | `CLAUDE.md` | Records the "Onion gate: skipped — throwaway spike" opt-out |
>
> **Run it:**
> ```bash
> cd ~/Desktop/local-weather && python3 -m http.server 8000
> ```
> Then open http://localhost:8000
>
> Features: auto-geolocation with city-search fallback, current temp/feels-like/humidity/wind/precip,
> 12-hour scrollable strip, 7-day forecast with precip probability, °F/°C toggle, remembers last
> location. No API key, no build step, no deps.
>
> Verified: `node --check app.js` passes, and I hit the live Open-Meteo endpoint to confirm the
> response shape matches what `app.js` reads (`current.*`, `current_units.wind_speed_10m`,
> `daily.*`).
>
> Two caveats worth knowing:
> - Geolocation is blocked over `file://` in Safari/Chrome, so double-clicking `index.html` will
>   fall back to the error message — city search still works. The local server path avoids this.
> - I only exercised the happy path against the API; the error branches (bad city, denied
>   permission) are written but untested.

### 3. Publish

> **User:** put all of this in a readme for the application and then push it as a public repo to github

Claude rewrote `README.md` to consolidate everything discussed — run instructions, features, file
layout, a "How it works" section covering the two Open-Meteo endpoints and the WMO code mapping,
and a Caveats section carrying forward the known limitations. Then:

```bash
git init && git add -A && git commit -m "Local Weather: dependency-free weather app using Open-Meteo"
gh repo create local-weather --public --source=. --remote=origin --push
```

Visibility was confirmed `PUBLIC` on branch `main`.

> **Claude:** Live at **https://github.com/wswarren12/local-weather** (public, `main`).
>
> Two things to note:
> - The clone URL in the README assumes the repo name; it resolves correctly against the actual
>   pushed repo, so it's accurate as written.
> - No `LICENSE` file was added, which means the code is technically all-rights-reserved despite
>   being a public repo. The Open-Meteo *data* attribution is covered in the README, but if you
>   want others to reuse the code, say the word and I'll add MIT.

### 4. This section

> **User:** for the readme -- actually include our whole conversation as well up to this point

Which produced what you're reading now.

### Notes on the transcript

The exchanges above are reproduced faithfully but lightly formatted for readability — tool calls
and file contents are summarized rather than pasted in full, since the files themselves are in
this repo. The narrative connective text between quotes was written for this README and was not
part of the original conversation.

### 5. License

> **User:** yes use MIT

An MIT `LICENSE` file was added, closing the open item from step 3.
