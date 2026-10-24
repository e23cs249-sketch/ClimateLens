import { db } from '../db/database.ts';
import { EvidenceSnapshot, IntegrityProof, EvidenceChange, WeatherData } from '../types/index.ts';
import { calculateSha256 } from '../utils/hashing.ts';
import { canonicalize } from '../utils/canonicalize.ts';

export function createEvidenceSnapshotFromWeather(
  weather: WeatherData,
  origin: 'live_provider' | 'demonstration' | 'historical_archive' = 'live_provider'
): EvidenceSnapshot {
  const id = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Canonical payload containing immutable atmospheric measurements
  const payloadObject = {
    location: {
      label: weather.location.label,
      latitude: Number(weather.location.latitude.toFixed(4)),
      longitude: Number(weather.location.longitude.toFixed(4)),
    },
    source: {
      provider: weather.source.name,
      model: weather.source.model,
      category: weather.source.category,
      attribution: weather.source.attribution,
    },
    timestamps: {
      sourceObservationTime: weather.timestamps.sourceTime,
      ingestionTime: weather.timestamps.retrievedAt,
    },
    measurements: {
      temperature_celsius: weather.values.temperature,
      apparent_temperature_celsius: weather.values.apparentTemperature,
      relative_humidity_percent: weather.values.relativeHumidity,
      precipitation_mm: weather.values.precipitation,
      wind_speed_kmh: weather.values.windSpeed,
      surface_pressure_hpa: weather.values.surfacePressure,
      weather_code: weather.values.weatherCode,
    },
    qualityAssessment: {
      freshness: weather.freshness.status,
      completeness: weather.completeness.status,
    },
  };

  const canonicalPayload = canonicalize(payloadObject);
  const { hash } = calculateSha256(canonicalPayload);

  // Look for previous snapshot for this location
  const prevSnapshot = db.getLatestSnapshotForLocation(weather.location.label, 'weather_surface');

  const snapshot: EvidenceSnapshot = {
    id,
    sourceId: weather.source.id,
    sourceName: weather.source.name,
    dataType: 'weather_surface',
    locationReference: weather.location.label,
    latitude: weather.location.latitude,
    longitude: weather.location.longitude,
    canonicalPayload,
    sourceTimestamp: weather.timestamps.sourceTime,
    retrievedAt: weather.timestamps.retrievedAt,
    validUntil: weather.timestamps.validUntil || null,
    freshnessStatus: weather.freshness.status,
    freshnessReason: weather.freshness.reason,
    completenessStatus: weather.completeness.status,
    missingFields: weather.completeness.missingFields,
    contentHash: hash,
    dataOrigin: origin,
    previousSnapshotId: prevSnapshot ? prevSnapshot.id : null,
    createdAt: now,
  };

  db.saveEvidenceSnapshot(snapshot);

  // Create local cryptographic integrity proof record
  const proof: IntegrityProof = {
    id: `prf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    evidenceSnapshotId: snapshot.id,
    hashAlgorithm: 'SHA-256',
    registeredHash: hash,
    proofType: 'local_cryptographic',
    verificationStatus: 'local_only',
    registeredAt: now,
  };
  db.saveIntegrityProof(proof);
  snapshot.proof = proof;

  // If previous snapshot exists, detect and log changes
  if (prevSnapshot) {
    try {
      const prevData = JSON.parse(prevSnapshot.canonicalPayload);
      const currData = payloadObject;

      const changedFields: Record<string, { previous: any; current: any }> = {};
      const changesList: string[] = [];

      const mPrev = prevData.measurements || {};
      const mCurr = currData.measurements || {};

      if (mPrev.temperature_celsius !== mCurr.temperature_celsius) {
        changedFields['temperature'] = {
          previous: mPrev.temperature_celsius,
          current: mCurr.temperature_celsius,
        };
        const diffVal = mCurr.temperature_celsius - mPrev.temperature_celsius;
        const delta = diffVal.toFixed(1);
        changesList.push(`Temperature shifted by ${diffVal > 0 ? '+' + delta : delta}°C`);
      }

      if (mPrev.precipitation_mm !== mCurr.precipitation_mm) {
        changedFields['precipitation'] = {
          previous: mPrev.precipitation_mm,
          current: mCurr.precipitation_mm,
        };
        changesList.push(`Precipitation changed from ${mPrev.precipitation_mm}mm to ${mCurr.precipitation_mm}mm`);
      }

      if (mPrev.wind_speed_kmh !== mCurr.wind_speed_kmh) {
        changedFields['windSpeed'] = {
          previous: mPrev.wind_speed_kmh,
          current: mCurr.wind_speed_kmh,
        };
        changesList.push(`Wind speed changed to ${mCurr.wind_speed_kmh} km/h`);
      }

      if (mPrev.relative_humidity_percent !== mCurr.relative_humidity_percent) {
        changedFields['humidity'] = {
          previous: mPrev.relative_humidity_percent,
          current: mCurr.relative_humidity_percent,
        };
        changesList.push(`Humidity changed to ${mCurr.relative_humidity_percent}%`);
      }

      if (Object.keys(changedFields).length > 0) {
        const changeRecord: EvidenceChange = {
          id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          evidenceSnapshotId: snapshot.id,
          previousSnapshotId: prevSnapshot.id,
          changeType: 'value_shift',
          changeSummary: changesList.join('; ') || 'Atmospheric parameters updated in latest model pass',
          changedFields,
          detectedAt: now,
        };
        db.saveEvidenceChange(changeRecord);
      }
    } catch (err) {
      console.warn('Failed to parse previous snapshot for change detection:', err);
    }
  }

  return snapshot;
}
