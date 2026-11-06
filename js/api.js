/* api.js
   Weather data layer: calls Open-Meteo directly from the browser (no backend). */

const WMO={0:[1000],1:[1000],2:[1003],3:[1009],45:[1135],48:[1147],51:[1153],53:[1153],55:[1153],56:[1168],57:[1168],61:[1183],63:[1189],65:[1195],66:[1198],67:[1198],71:[1213],73:[1219],75:[1225],77:[1213],80:[1240],81:[1243],82:[1246],85:[1255],86:[1258],95:[1087],96:[1276],99:[1276]};
const wcond = c => ({ code: (WMO[c] || [1009])[0], wmo: WMO[c] ? c : -1, text: '', icon: '' });
const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

async function fetchWeather(q) {
  const [la, lo] = String(q).split(',').map(Number);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) throw new Error('Invalid location');
  const u =
    `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}` +
    `&timezone=auto&forecast_days=14&wind_speed_unit=kmh` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,visibility,uv_index` +
    `&hourly=temperature_2m,weather_code,is_day,precipitation_probability,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index,visibility,surface_pressure,cloud_cover` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,moonrise,moonset,moon_phase,precipitation_probability_max`;

  const r = await fetch(u, { signal: tmo(15000) });
  if (!r.ok) throw new Error('Open-Meteo ' + r.status);
  const j = await r.json();
  if (!j.current || !j.hourly || !j.daily) throw new Error('Open-Meteo: incomplete data');

  let aq = null, aqH = [];
  try {
    const a = await (await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${la}&longitude=${lo}&current=us_aqi&hourly=us_aqi&forecast_days=4&timezone=auto`,
      { signal: tmo(8000) }
    )).json();
    const epa = v => Number.isFinite(v) ? (v <= 50 ? 1 : v <= 100 ? 2 : v <= 150 ? 3 : v <= 200 ? 4 : v <= 300 ? 5 : 6) : null;
    aq = epa(a?.current?.us_aqi);
    aqH = (a?.hourly?.us_aqi || []).slice(0, 96).map(epa);
  } catch {}

  const c = j.current, H = j.hourly, D = j.daily;
  const n = x => Number.isFinite(Number(x)) ? Number(x) : 0;
  const T = n(c.temperature_2m), RH = n(c.relative_humidity_2m);
  const g = Math.log(Math.max(RH, 1) / 100) + 17.62 * T / (243.12 + T);
  const dew = 243.12 * g / (17.62 - g);
  const wd = n(c.wind_direction_10m);
  const lt = String(c.time || '').replace('T', ' ');

  const r1 = x => Math.round(n(x) * 10) / 10;
  const sl = arr => (arr || []).slice(0, 96);
  const metrics = {
    start: String(H.time[0]).replace('T', ' '),
    feels: sl(H.apparent_temperature).map(r1),
    hum: sl(H.relative_humidity_2m).map(x => Math.round(n(x))),
    wind: sl(H.wind_speed_10m).map(x => Math.round(n(x))),
    wdir: sl(H.wind_direction_10m).map(x => Math.round(n(x))),
    uv: sl(H.uv_index).map(r1),
    vis: sl(H.visibility).map(x => Math.round(n(x) / 100) / 10),
    pres: sl(H.surface_pressure).map(x => Math.round(n(x))),
    cloud: sl(H.cloud_cover).map(x => Math.round(n(x))),
    aqi: aqH
  };

  return {
    ver: 7,
    metrics,
    location: { name: '', country: '', localtime: lt },
    current: {
      last_updated: lt,
      temp_c: T,
      feelslike_c: n(c.apparent_temperature),
      humidity: RH,
      cloud: n(c.cloud_cover),
      dewpoint_c: Math.round(dew * 10) / 10,
      wind_kph: n(c.wind_speed_10m),
      gust_kph: n(c.wind_gusts_10m),
      wind_dir: DIRS[Math.round(wd / 22.5) % 16],
      wind_degree: wd,
      uv: n(c.uv_index),
      vis_km: Math.round(n(c.visibility) / 100) / 10,
      pressure_mb: Math.round(n(c.surface_pressure)),
      is_day: c.is_day === 1 ? 1 : 0,
      condition: wcond(c.weather_code),
      air_quality: { 'us-epa-index': aq }
    },
    forecast: {
      forecastday: D.time.map((d, i) => ({
        date: d,
        day: {
          maxtemp_c: n(D.temperature_2m_max[i]),
          mintemp_c: n(D.temperature_2m_min[i]),
          rain: n(D.precipitation_probability_max[i]),
          condition: wcond(D.weather_code[i])
        },
        astro: {
          sunrise: D.sunrise[i] || null,
          sunset: D.sunset[i] || null,
          moonrise: D.moonrise?.[i] || null,
          moonset: D.moonset?.[i] || null,
          moon_phase: D.moon_phase?.[i] ?? null
        },
        hour: i >= 4 ? [] : H.time.slice(i * 24, i * 24 + 24).map((t, k) => ({
          time: t.replace('T', ' '),
          temp_c: n(H.temperature_2m[i * 24 + k]),
          is_day: H.is_day[i * 24 + k] === 1 ? 1 : 0,
          condition: { code: wcond(H.weather_code[i * 24 + k]).code },
          chance_of_rain: n(H.precipitation_probability[i * 24 + k])
        }))
      }))
    }
  };
}
