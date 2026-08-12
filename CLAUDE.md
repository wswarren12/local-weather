# local-weather

**Onion gate: skipped — throwaway spike.** (User confirmed explicitly.)

Static single-page weather app. No build step, no dependencies, no API key.

## Stack
- Plain HTML/CSS/JS (`index.html`, `style.css`, `app.js`)
- [Open-Meteo](https://open-meteo.com) forecast + geocoding APIs (free, keyless)
- `localStorage` for last place + unit preference

## Run
```bash
open index.html
# or, if geolocation needs a proper origin:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Notes
- Geolocation over `file://` is blocked in some browsers — use the local server, or just search a city.
- Units toggle between °F/mph and °C/km/h; precipitation is always inches.
