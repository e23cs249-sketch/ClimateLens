import { CompletenessAssessment, CompletenessStatus } from '../types/index.ts';

const EXPECTED_WEATHER_FIELDS = [
  'temperature',
  'apparentTemperature',
  'relativeHumidity',
  'precipitation',
  'windSpeed',
  'surfacePressure',
];

export function assessCompleteness(
  dataType: string,
  values: Record<string, any> | undefined | null
): CompletenessAssessment {
  if (!values || typeof values !== 'object') {
    return {
      status: 'unknown',
      missingFields: EXPECTED_WEATHER_FIELDS,
      totalExpectedFields: EXPECTED_WEATHER_FIELDS.length,
      reason: 'No telemetry values object was supplied by the upstream provider.',
    };
  }

  const expected = EXPECTED_WEATHER_FIELDS;
  const missing = expected.filter((field) => values[field] === undefined || values[field] === null);

  if (missing.length === 0) {
    return {
      status: 'complete',
      missingFields: [],
      totalExpectedFields: expected.length,
      reason: `All ${expected.length} core atmospheric parameters were present and successfully parsed.`,
    };
  }

  const status: CompletenessStatus = missing.length === expected.length ? 'unknown' : 'partial';
  return {
    status,
    missingFields: missing,
    totalExpectedFields: expected.length,
    reason: `Incomplete telemetry payload: missing ${missing.length} of ${expected.length} expected fields (${missing.join(', ')}).`,
  };
}
