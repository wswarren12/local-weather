const WMO = {
  0:  ["Clear sky", "☀️"],
  1:  ["Mainly clear", "🌤️"],
  2:  ["Partly cloudy", "⛅"],
  3:  ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm, hail", "⛈️"],
  99: ["Thunderstorm, hail", "⛈️"],
};

const el = (id) => document.getElementById(id);
const state = {
  unit: localStorage.getItem("unit") || "fahrenheit",
  place: null,
};

const describe = (code) => WMO[code] || ["Unknown", "❓"];
const unitSuffix = () => (state.unit === "celsius" ? "°C" : "°F");
const round = (n) => (n == null ? "–" : `${Math.round(n)}${unitSuffix()}`);

function setStatus(msg, isError = false) {
  const s = el("status");
  s.textContent = msg || "";
  s.classList.toggle("hidden", !msg);
  s.classList.toggle("error", isError);
}

async function geocode(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error(`No match for "${name}"`);
  const r = data.results[0];
  return {
    lat: r.latitude,
    lon: r.longitude,
    label: [r.name, r.admin1, r.country_code].filter(Boolean).join(", "),
  };
}

async function fetchWeather({ lat, lon }) {
  const tempUnit = state.unit;
  const windUnit = state.unit === "celsius" ? "kmh" : "mph";
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=inch&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  return res.json();
}

function renderCurrent(data, label) {
  const c = data.current;
  const [text, icon] = describe(c.weather_code);
  el("place-name").textContent = label;
  el("observed").textContent = `Updated ${new Date(c.time).toLocaleString([], {
    weekday: "short", hour: "numeric", minute: "2-digit",
  })}`;
  el("icon").textContent = icon;
  el("temp").textContent = round(c.temperature_2m);
  el("condition").textContent = text;
  el("feels").textContent = round(c.apparent_temperature);
  el("humidity").textContent = `${Math.round(c.relative_humidity_2m)}%`;
  el("wind").textContent = `${Math.round(c.wind_speed_10m)} ${data.current_units.wind_speed_10m}`;
  el("precip").textContent = `${c.precipitation.toFixed(2)} in`;
  el("current").classList.remove("hidden");
}

function renderHourly(data) {
  const now = Date.now();
  const rows = data.hourly.time
    .map((t, i) => ({ t: new Date(t), temp: data.hourly.temperature_2m[i], code: data.hourly.weather_code[i] }))
    .filter((r) => r.t.getTime() >= now - 30 * 60 * 1000)
    .slice(0, 12);

  el("hourly").innerHTML = rows
    .map((r) => {
      const [, icon] = describe(r.code);
      const time = r.t.toLocaleTimeString([], { hour: "numeric" });
      return `<div class="hour">
        <div class="h-time">${time}</div>
        <div class="h-icon">${icon}</div>
        <div class="h-temp">${round(r.temp)}</div>
      </div>`;
    })
    .join("");
  el("hourly-section").classList.remove("hidden");
}

function renderDaily(data) {
  const d = data.daily;
  el("daily").innerHTML = d.time
    .map((t, i) => {
      const [text, icon] = describe(d.weather_code[i]);
      const day = i === 0 ? "Today" : new Date(`${t}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "numeric", day: "numeric" });
      const pop = d.precipitation_probability_max[i];
      return `<li>
        <span class="d-day">${day}<br><span class="d-range" style="font-size:13px">${text}${pop != null ? ` · ${pop}%` : ""}</span></span>
        <span class="d-icon">${icon}</span>
        <span class="d-range"><strong>${round(d.temperature_2m_max[i])}</strong> / ${round(d.temperature_2m_min[i])}</span>
      </li>`;
    })
    .join("");
  el("daily-section").classList.remove("hidden");
}

async function load(place) {
  state.place = place;
  localStorage.setItem("place", JSON.stringify(place));
  setStatus("Loading forecast…");
  try {
    const data = await fetchWeather(place);
    renderCurrent(data, place.label);
    renderHourly(data);
    renderDaily(data);
    setStatus("");
  } catch (err) {
    setStatus(err.message, true);
  }
}

function locate() {
  if (!navigator.geolocation) return setStatus("Geolocation unsupported in this browser.", true);
  setStatus("Locating…");
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => load({ lat: coords.latitude, lon: coords.longitude, label: "Current location" }),
    () => setStatus("Location denied — search for a city instead.", true),
    { timeout: 10000 }
  );
}

el("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = el("query").value.trim();
  if (!q) return;
  setStatus(`Searching “${q}”…`);
  try {
    load(await geocode(q));
  } catch (err) {
    setStatus(err.message, true);
  }
});

el("locate").addEventListener("click", locate);

el("unit-toggle").addEventListener("click", () => {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  localStorage.setItem("unit", state.unit);
  el("unit-toggle").textContent = state.unit === "celsius" ? "Switch to °F" : "Switch to °C";
  if (state.place) load(state.place);
});

// boot
el("unit-toggle").textContent = state.unit === "celsius" ? "Switch to °F" : "Switch to °C";
const saved = localStorage.getItem("place");
if (saved) load(JSON.parse(saved));
else locate();
