import { WeatherData, SourceCategory } from '../types/index.ts';
import { assessFreshness } from '../services/freshness.service.ts';
import { assessCompleteness } from '../services/completeness.service.ts';
import { calculateSha256 } from '../utils/hashing.ts';

const WMO_CODE_MAP: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense intensity drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function searchLocations(query: string) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ClimateLens-Hackathon/1.0' } });
    if (!res.ok) {
      console.warn(`Geocoding failed with status ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => ({
      id: `${item.latitude},${item.longitude}`,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      label: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
    }));
  } catch (err) {
    console.error('Error fetching geocoding:', err);
    return [];
  }
}

export async function fetchLiveWeatherData(
  latitude: number,
  longitude: number,
  locationLabel: string
): Promise<WeatherData> {
  const retrievalTime = new Date().toISOString();

  // 1. Fetch weather forecast & current conditions
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&forecast_days=7`;

  // 2. Fetch air quality
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide&timezone=auto`;

  let weatherJson: any = null;
  let aqiJson: any = null;

  try {
    const [wRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { headers: { 'User-Agent': 'ClimateLens-Hackathon/1.0' } }),
      fetch(airQualityUrl, { headers: { 'User-Agent': 'ClimateLens-Hackathon/1.0' } }),
    ]);

    if (wRes.status === 'fulfilled' && wRes.value.ok) {
      weatherJson = await wRes.value.json();
    } else if (wRes.status === 'fulfilled') {
      throw new Error(`Open-Meteo weather API returned HTTP ${wRes.value.status}. Retry shortly and check Open-Meteo service status.`);
    } else {
      throw new Error('Could not reach the Open-Meteo weather API. Check server outbound network access and retry.');
    }

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      aqiJson = await aqiRes.value.json();
    }
  } catch (err) {
    console.error('Provider fetch failure:', err);
    throw err;
  }

  const current = weatherJson.current || {};
  const currentUnits = weatherJson.current_units || {};
  const hourly = weatherJson.hourly || {};
  const daily = weatherJson.daily || {};

  const sourceTime = current.time ? new Date(current.time).toISOString() : null;

  const values = {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    relativeHumidity: current.relative_humidity_2m,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    weatherDescription: WMO_CODE_MAP[current.weather_code] || 'Atmospheric condition noted',
    windSpeed: current.wind_speed_10m,
    surfacePressure: current.surface_pressure,
    uvIndex: daily.uv_index_max ? daily.uv_index_max[0] : undefined,
  };

  const units: Record<string, string> = {
    temperature: currentUnits.temperature_2m || '°C',
    apparentTemperature: currentUnits.apparent_temperature || '°C',
    relativeHumidity: currentUnits.relative_humidity_2m || '%',
    precipitation: currentUnits.precipitation || 'mm',
    windSpeed: currentUnits.wind_speed_10m || 'km/h',
    surfacePressure: currentUnits.surface_pressure || 'hPa',
  };

  // Build hourly array (next 24 hours)
  const hourlyForecast: WeatherData['hourlyForecast'] = [];
  if (hourly.time && Array.isArray(hourly.time)) {
    const limit = Math.min(24, hourly.time.length);
    for (let i = 0; i < limit; i++) {
      hourlyForecast.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m ? hourly.temperature_2m[i] : 0,
        precipitationProbability: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
        precipitation: hourly.precipitation ? hourly.precipitation[i] : 0,
        windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0,
      });
    }
  }

  // Build daily forecast (next 7 days)
  const dailyForecast: WeatherData['dailyForecast'] = [];
  if (daily.time && Array.isArray(daily.time)) {
    for (let i = 0; i < daily.time.length; i++) {
      dailyForecast.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max ? daily.temperature_2m_max[i] : 0,
        tempMin: daily.temperature_2m_min ? daily.temperature_2m_min[i] : 0,
        precipitationSum: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
        uvIndexMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
        weatherCode: daily.weather_code ? daily.weather_code[i] : 0,
      });
    }
  }

  // Air quality mapping
  let airQuality: WeatherData['airQuality'] = undefined;
  if (aqiJson && aqiJson.current) {
    const curAqi = aqiJson.current;
    const usAqi = curAqi.us_aqi || 0;
    let statusLabel = 'Good';
    if (usAqi > 300) statusLabel = 'Hazardous';
    else if (usAqi > 200) statusLabel = 'Very Unhealthy';
    else if (usAqi > 150) statusLabel = 'Unhealthy';
    else if (usAqi > 100) statusLabel = 'Unhealthy for Sensitive Groups';
    else if (usAqi > 50) statusLabel = 'Moderate';

    airQuality = {
      europeanAqi: curAqi.european_aqi || 0,
      usAqi,
      pm2_5: curAqi.pm2_5 || 0,
      pm10: curAqi.pm10 || 0,
      ozone: curAqi.ozone || 0,
      nitrogenDioxide: curAqi.nitrogen_dioxide || 0,
      statusLabel,
    };
  }

  // Run freshness assessment
  const freshness = assessFreshness('weather_surface', sourceTime, retrievalTime, null);

  // Run completeness assessment
  const completeness = assessCompleteness('weather_surface', values);

  // Build canonical record payload for hashing
  const canonicalData = {
    location: {
      label: locationLabel,
      latitude,
      longitude,
    },
    source: {
      provider: 'Open-Meteo Weather Model Suite',
      modelSuite: 'ECMWF_IFS / DWD_ICON / GFS Multi-Model Ensemble',
      category: 'forecast' as SourceCategory,
    },
    timestamps: {
      sourceTime,
      retrievedAt: retrievalTime,
    },
    values: {
      temperature: values.temperature,
      apparentTemperature: values.apparentTemperature,
      relativeHumidity: values.relativeHumidity,
      precipitation: values.precipitation,
      windSpeed: values.windSpeed,
      surfacePressure: values.surfacePressure,
      weatherCode: values.weatherCode,
    },
    units,
  };

  const { hash } = calculateSha256(canonicalData);

  return {
    location: {
      label: locationLabel,
      latitude,
      longitude,
      timezone: weatherJson.timezone,
    },
    source: {
      id: 'src-open-meteo',
      name: 'Open-Meteo Weather Model Suite',
      category: 'forecast',
      url: 'https://open-meteo.com',
      attribution: 'Weather data provided by Open-Meteo under CC BY 4.0',
      model: 'ECMWF IFS / DWD ICON Ensemble',
    },
    values,
    units,
    timestamps: {
      sourceTime: sourceTime || retrievalTime,
      retrievedAt: retrievalTime,
      validUntil: new Date(new Date(retrievalTime).getTime() + 2 * 3600 * 1000).toISOString(),
    },
    airQuality,
    hourlyForecast,
    dailyForecast,
    freshness,
    completeness,
    contentHash: hash,
  };
}
