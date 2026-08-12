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

## Credits

Weather data from [Open-Meteo](https://open-meteo.com), free for non-commercial use under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
