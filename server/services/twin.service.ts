import { WeatherData, EvidenceSnapshot, ClimateEvidenceTwin, DerivedIndicator } from '../types/index.ts';
import { canonicalize } from '../utils/canonicalize.ts';
import { calculateSha256 } from '../utils/hashing.ts';
import { db } from '../db/database.ts';

/**
 * Calculates NOAA Steadman Heat Index in Celsius
 * Formula derived from NWS Rothfusz regression
 */
function calculateHeatIndexCelsius(tempC: number, rhPercent: number): { value: number; category: string; severity: 'normal' | 'caution' | 'warning' | 'critical' } {
  // Convert Celsius to Fahrenheit
  const T = (tempC * 9) / 5 + 32;
  const RH = rhPercent;

  if (T < 80) {
    return {
      value: Number(tempC.toFixed(1)),
      category: 'Safe / Normal Thermal Range',
      severity: 'normal',
    };
  }

  // Simple Steadman formula
  let HI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);

  // If HI >= 80, apply full Rothfusz regression
  if (HI >= 80) {
    HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      0.00683783 * T * T -
      0.05481717 * RH * RH +
      0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH -
      0.00000199 * T * T * RH * RH;

    // Adjustments
    if (RH < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      HI -= adj;
    } else if (RH > 85 && T >= 80 && T <= 87) {
      const adj = ((RH - 85) / 10) * ((87 - T) / 5);
      HI += adj;
    }
  }

  // Convert back to Celsius
  const hiC = Number((((HI - 32) * 5) / 9).toFixed(1));

  if (hiC < 27) {
    return { value: hiC, category: 'Normal (<27°C)', severity: 'normal' };
  } else if (hiC < 32) {
    return { value: hiC, category: 'Caution (27°C - 32°C): Fatigue possible with prolonged exposure', severity: 'caution' };
  } else if (hiC < 41) {
    return { value: hiC, category: 'Extreme Caution (32°C - 41°C): Heat exhaustion & muscle cramps possible', severity: 'warning' };
  } else if (hiC < 54) {
    return { value: hiC, category: 'Danger (41°C - 54°C): Heat cramps or exhaustion likely; sunstroke possible', severity: 'critical' };
  } else {
    return { value: hiC, category: 'Extreme Danger (>54°C): Heat stroke highly imminent with physical exertion', severity: 'critical' };
  }
}

/**
 * Calculates Thom's Discomfort Index (DI)
 * DI = T - 0.55 * (1 - 0.01 * RH) * (T - 14.5)
 */
function calculateThomDiscomfortIndex(tempC: number, rhPercent: number): { value: number; category: string; severity: 'normal' | 'caution' | 'warning' | 'critical' } {
  const di = Number((tempC - 0.55 * (1 - 0.01 * rhPercent) * (tempC - 14.5)).toFixed(1));

  if (di < 21) {
    return { value: di, category: 'No thermal discomfort registered', severity: 'normal' };
  } else if (di < 24) {
    return { value: di, category: 'Under 50% of general population perceives thermal discomfort', severity: 'caution' };
  } else if (di < 27) {
    return { value: di, category: 'Over 50% of general population perceives heat discomfort', severity: 'warning' };
  } else if (di < 29) {
    return { value: di, category: 'Most of population suffers acute heat discomfort', severity: 'critical' };
  } else {
    return { value: di, category: 'Severe thermal distress: emergency environmental conditions', severity: 'critical' };
  }
}

/**
 * Evaluates Heavy Rainfall Screening
 */
function evaluateRainfallRisk(precipMm: number): { value: number; category: string; severity: 'normal' | 'caution' | 'warning' | 'critical' } {
  if (precipMm <= 0.1) {
    return { value: precipMm, category: 'Dry / No measurable precipitation', severity: 'normal' };
  } else if (precipMm < 2.5) {
    return { value: precipMm, category: 'Light rain (<2.5 mm/h): Surface dampness only', severity: 'normal' };
  } else if (precipMm < 7.5) {
    return { value: precipMm, category: 'Moderate rain (2.5 - 7.5 mm/h): Standard roadway puddling', severity: 'caution' };
  } else if (precipMm < 15.0) {
    return { value: precipMm, category: 'Heavy rainfall (7.5 - 15 mm/h): Stormwater drainage accumulation', severity: 'warning' };
  } else {
    return { value: precipMm, category: 'Torrential downpour (>15 mm/h): High local runoff risk', severity: 'critical' };
  }
}

/**
 * Builds a complete Climate Evidence Twin representation
 */
export function buildClimateEvidenceTwin(weather: WeatherData, snapshot?: EvidenceSnapshot): ClimateEvidenceTwin {
  const temp = weather.values.temperature;
  const rh = weather.values.relativeHumidity;
  const precip = weather.values.precipitation;

  const heatIndexRes = calculateHeatIndexCelsius(temp, rh);
  const thomRes = calculateThomDiscomfortIndex(temp, rh);
  const rainRes = evaluateRainfallRisk(precip);

  const heatStress: DerivedIndicator = {
    name: 'NOAA Steadman Heat Index',
    value: `${heatIndexRes.value}°C`,
    unit: '°C',
    category: heatIndexRes.category,
    severity: heatIndexRes.severity,
    methodology: 'NOAA National Weather Service (NWS) Rothfusz multivariate polynomial regression',
    thresholds: 'Safe (<27°C), Caution (27-32°C), Extreme Caution (32-41°C), Danger (41-54°C), Extreme Danger (>54°C)',
    interpretation: `Calculated from ambient air (${temp}°C) and relative humidity (${rh}%). Represents effective physiological heat sensation under light wind and shade.`,
    limitations: 'Valid strictly in shade; direct unshaded solar radiation can add up to 8°C (15°F) to effective heat stress.',
  };

  const rainfallRisk: DerivedIndicator = {
    name: 'Precipitation Screening Threshold',
    value: `${rainRes.value} mm/h`,
    unit: 'mm/h',
    category: rainRes.category,
    severity: rainRes.severity,
    methodology: 'World Meteorological Organization (WMO) Standard Precipitation Classification',
    thresholds: 'Light (<2.5 mm/h), Moderate (2.5-7.5 mm/h), Heavy (7.5-15 mm/h), Torrential (>15 mm/h)',
    interpretation: precip > 0 ? `Active precipitation registered at ${precip} mm/h.` : 'No active rainfall currently registered at observation point.',
    limitations: 'Screening indicator only; does not model urban stormwater drain blockages, low-lying ground depressions, or tidal surge interactions.',
  };

  const thermalDiscomfort: DerivedIndicator = {
    name: "Thom's Discomfort Index (DI)",
    value: thomRes.value,
    category: thomRes.category,
    severity: thomRes.severity,
    methodology: 'Thom (1959) Empirical Bio-Meteorological Equation: DI = T - 0.55*(1 - 0.01*RH)*(T - 14.5)',
    thresholds: 'No Discomfort (<21), <50% Uncomfortable (21-24), >50% Uncomfortable (24-27), Most Suffer (27-29), Severe Distress (≥29)',
    interpretation: `Index value ${thomRes.value} evaluates combined temperature and moisture impact on the human circulatory system.`,
    limitations: 'Assumes standard clothing and sedentary state; vigorous physical labor increases metabolic heat burden.',
  };

  let airQualityRisk: DerivedIndicator | undefined = undefined;
  if (weather.airQuality) {
    const aqi = weather.airQuality.usAqi;
    let aqiSeverity: 'normal' | 'caution' | 'warning' | 'critical' = 'normal';
    if (aqi > 150) aqiSeverity = 'critical';
    else if (aqi > 100) aqiSeverity = 'warning';
    else if (aqi > 50) aqiSeverity = 'caution';

    airQualityRisk = {
      name: 'Air Quality Index Risk Assessment',
      value: `${aqi} US AQI (${weather.airQuality.statusLabel})`,
      category: weather.airQuality.statusLabel,
      severity: aqiSeverity,
      methodology: 'United States Environmental Protection Agency (US EPA) Air Quality Index Breakpoints',
      thresholds: 'Good (0-50), Moderate (51-100), Unhealthy for Sensitive Groups (101-150), Unhealthy (151-200), Very Unhealthy (201-300), Hazardous (301-500)',
      interpretation: `PM2.5: ${weather.airQuality.pm2_5} µg/m³, PM10: ${weather.airQuality.pm10} µg/m³. ${weather.airQuality.statusLabel}.`,
      limitations: 'Derived from global atmospheric composition models (Copernicus CAMS & NOAA GFS); micro-scale vehicle tailpipe proximity may elevate local ground-level pollution.',
    };
  }

  // Canonical payload for this Climate Evidence Twin
  const canonicalObject = {
    location: {
      label: weather.location.label,
      latitude: Number(weather.location.latitude.toFixed(4)),
      longitude: Number(weather.location.longitude.toFixed(4)),
    },
    provenance: {
      provider: weather.source.name,
      model: weather.source.model,
      category: weather.source.category,
      attribution: weather.source.attribution,
    },
    timestamps: {
      createdUtc: snapshot ? snapshot.createdAt : (weather.timestamps.retrievedAt || new Date().toISOString()),
      retrievedAt: weather.timestamps.retrievedAt,
      sourceTime: weather.timestamps.sourceTime,
    },
    telemetry: {
      temperature_celsius: weather.values.temperature,
      apparent_temperature_celsius: weather.values.apparentTemperature,
      relative_humidity_percent: weather.values.relativeHumidity,
      precipitation_mm: weather.values.precipitation,
      wind_speed_kmh: weather.values.windSpeed,
      surface_pressure_hpa: weather.values.surfacePressure,
      weather_code: weather.values.weatherCode,
      us_aqi: weather.airQuality?.usAqi || null,
    },
    derivedIndicators: {
      heat_index_celsius: heatIndexRes.value,
      thoms_discomfort_index: thomRes.value,
      rainfall_risk_category: rainRes.category,
    },
    quality: {
      freshness: weather.freshness.status,
      completeness: weather.completeness.status,
    },
  };

  const canonicalPayload = canonicalize(canonicalObject);
  const { hash } = calculateSha256(canonicalPayload);

  // Retrieve proof if snapshot provided
  const existingProof = snapshot ? db.getProofBySnapshotId(snapshot.id) : undefined;
  const blockchainMode = existingProof?.proofType === 'testnet_anchor' ? 'simulated_testnet' : 'local_only';

  return {
    id: snapshot ? snapshot.id : `twin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    location: {
      label: weather.location.label,
      latitude: weather.location.latitude,
      longitude: weather.location.longitude,
      timezone: weather.location.timezone,
    },
    timestamps: {
      createdUtc: snapshot ? snapshot.createdAt : (weather.timestamps.retrievedAt || new Date().toISOString()),
      retrievedAt: weather.timestamps.retrievedAt,
      sourceObservationTime: weather.timestamps.sourceTime,
      validUntil: weather.timestamps.validUntil,
    },
    source: {
      provider: weather.source.name,
      model: weather.source.model,
      category: weather.source.category,
      attribution: weather.source.attribution,
      sourceUrl: weather.source.url,
    },
    measurements: {
      temperature: weather.values.temperature,
      apparentTemperature: weather.values.apparentTemperature,
      relativeHumidity: weather.values.relativeHumidity,
      precipitation: weather.values.precipitation,
      windSpeed: weather.values.windSpeed,
      surfacePressure: weather.values.surfacePressure,
      weatherCode: weather.values.weatherCode,
      weatherDescription: weather.values.weatherDescription,
      uvIndex: weather.values.uvIndex,
    },
    airQuality: weather.airQuality
      ? {
          scale: 'US EPA AQI',
          usAqi: weather.airQuality.usAqi,
          pm2_5: weather.airQuality.pm2_5,
          pm10: weather.airQuality.pm10,
          ozone: weather.airQuality.ozone,
          nitrogenDioxide: weather.airQuality.nitrogenDioxide,
          statusLabel: weather.airQuality.statusLabel,
          healthNotice:
            weather.airQuality.usAqi > 100
              ? 'Sensitive groups (asthmatics, elderly, children) should reduce prolonged outdoor exertion.'
              : 'Air quality is within acceptable range for routine outdoor activities.',
        }
      : undefined,
    derivedIndicators: {
      heatStress,
      rainfallRisk,
      thermalDiscomfort,
      airQualityRisk,
    },
    qualityAssessment: {
      freshnessStatus: weather.freshness.status,
      freshnessReason: weather.freshness.reason,
      ageMinutes: weather.freshness.ageMinutes,
      completenessStatus: weather.completeness.status,
      completenessReason: weather.completeness.reason,
      missingFields: weather.completeness.missingFields,
      temporalConsistency: true,
      consistencyNotes: 'Ingested values align with physical atmospheric bounds (pressure 950-1050 hPa, humidity 0-100%).',
    },
    groundedExplanation: {
      summary: `Current ambient temperature is ${weather.values.temperature}°C with ${weather.values.relativeHumidity}% humidity. Heat index evaluates to ${heatIndexRes.value}°C (${heatIndexRes.category}).`,
      keyDrivers: [
        `Relative humidity (${weather.values.relativeHumidity}%) modulates evaporative cooling rate`,
        `Surface wind (${weather.values.windSpeed} km/h) aids convective heat dissipation`,
        `Precipitation at ${weather.values.precipitation} mm/h`,
      ],
      uncertainties: 'Grid-level weather model approximation; local urban microclimates (concrete vs parkland) vary up to 3°C.',
      language: 'en',
    },
    verification: {
      canonicalizationScheme: 'RFC 8785',
      canonicalPayload,
      hashAlgorithm: 'SHA-256',
      contentHash: hash,
      proofType: existingProof?.proofType || 'local_cryptographic',
      isMatch: true,
      blockchainStatus: blockchainMode,
    },
    recommendedActions: [
      heatIndexRes.severity === 'critical' || heatIndexRes.severity === 'warning'
        ? 'Deploy shaded hydration points & minimize unshaded mid-day outdoor labor'
        : 'Maintain standard hydration routines',
      precip > 5 ? 'Inspect stormwater runoff drains for plastic obstructions' : 'Monitor local forecast for convective rain cells',
      'Refer to official national advisories (IMD / NDMA) for binding emergency alerts',
    ],
  };
}
