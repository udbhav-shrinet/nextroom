import { FLAGSHIP_STATIONS } from '../constants/flagshipStations';

const RADIO_BROWSER_MIRRORS = [
  'https://all.api.radio-browser.info/json',
  'https://de1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json'
];

let activeMirror = RADIO_BROWSER_MIRRORS[0];

export async function searchStations({ query = '', tag = '', country = '', limit = 30 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    order: 'clickcount',
    reverse: 'true',
    hidebroken: 'true'
  });

  if (query) params.append('name', query);
  if (tag) params.append('tag', tag);
  if (country) params.append('countrycode', country);

  for (const mirror of RADIO_BROWSER_MIRRORS) {
    try {
      const res = await fetch(`${mirror}/stations/search?${params.toString()}`, {
        headers: { 'User-Agent': 'NextRoom-Sanctuary/1.0' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      activeMirror = mirror;
      return data.map(st => ({
        id: st.stationuuid || st.changeuuid || Math.random().toString(),
        name: st.name?.trim() || 'Live Radio Stream',
        country: st.country || 'Global',
        countryCode: st.countrycode || 'WW',
        genre: st.tags ? st.tags.split(',').slice(0, 3).join(', ') : 'Live Stream',
        bitrate: st.bitrate ? `${st.bitrate}k ${st.codec || 'MP3'}` : '128k MP3',
        url: st.url_resolved || st.url,
        homepage: st.homepage || '',
        favicon: st.favicon || '',
        votes: st.votes || 0,
        clicks: st.clickcount || 0,
      }));
    } catch {
      // Try next mirror
    }
  }

  // Fallback to local flagship stations matching filter
  return FLAGSHIP_STATIONS.filter(st => {
    if (query && !st.name.toLowerCase().includes(query.toLowerCase()) && !st.genre.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    if (tag && !st.genre.toLowerCase().includes(tag.toLowerCase())) {
      return false;
    }
    return true;
  });
}

// 🎲 World Spin: Random station from flagships or top global
export function getRandomWorldStation() {
  const idx = Math.floor(Math.random() * FLAGSHIP_STATIONS.length);
  return FLAGSHIP_STATIONS[idx];
}

// Weather via Open-Meteo
export async function getLiveWeather(lat = 35.6762, lon = 139.6503) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Weather fetch failed');
    return await res.json();
  } catch (err) {
    // Fallback safe dummy data
    return {
      current: {
        temperature_2m: 19.5,
        apparent_temperature: 19.0,
        relative_humidity_2m: 68,
        precipitation: 0.2,
        weather_code: 61, // Rain
        wind_speed_10m: 12.4
      },
      hourly: {
        temperature_2m: [18, 18, 17, 17, 19, 21, 22, 22, 20, 19, 18, 18]
      }
    };
  }
}

export async function searchCities(cityName) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}
