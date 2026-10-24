import { FreshnessAssessment, FreshnessStatus } from '../types/index.ts';

const THRESHOLDS_MINUTES: Record<string, number> = {
  weather_surface: 120, // 2 hours
  forecast_hourly: 360, // 6 hours
  air_quality: 180, // 3 hours
  advisory_bulletin: 720, // 12 hours
};

export function assessFreshness(
  dataType: string,
  sourceTime: string | null | undefined,
  retrievedAt: string,
  validUntil: string | null | undefined
): FreshnessAssessment {
  const thresholdMinutes = THRESHOLDS_MINUTES[dataType] || 120;
  const now = new Date();

  // Check expiration if validUntil is given
  if (validUntil) {
    const validDate = new Date(validUntil);
    if (!isNaN(validDate.getTime()) && now.getTime() > validDate.getTime()) {
      const expiredMinsAgo = Math.round((now.getTime() - validDate.getTime()) / (1000 * 60));
      return {
        status: 'expired',
        ageMinutes: expiredMinsAgo,
        thresholdMinutes,
        reason: `Record expired ${expiredMinsAgo} minutes ago (stated validity cutoff was ${validUntil}). New bulletin or forecast cycle expected.`,
        sourceTime: sourceTime || null,
        retrievedAt,
        validUntil,
      };
    }
  }

  // Assess age based on source observation/publication time if provided, or retrieval time
  const referenceTimeStr = sourceTime || retrievedAt;
  const refDate = new Date(referenceTimeStr);

  if (isNaN(refDate.getTime())) {
    return {
      status: 'unknown',
      ageMinutes: null,
      thresholdMinutes,
      reason: 'No valid timestamp was provided by the external source. Data age cannot be independently verified.',
      sourceTime: null,
      retrievedAt,
      validUntil: validUntil || null,
    };
  }

  const ageMinutes = Math.max(0, Math.round((now.getTime() - refDate.getTime()) / (1000 * 60)));

  if (ageMinutes > thresholdMinutes) {
    const hours = (ageMinutes / 60).toFixed(1);
    const thresholdHours = (thresholdMinutes / 60).toFixed(1);
    return {
      status: 'stale',
      ageMinutes,
      thresholdMinutes,
      reason: `Information is ${hours}h old, exceeding the ${thresholdHours}h operational freshness threshold for ${dataType.replace('_', ' ')}. Data may not reflect recent shifts.`,
      sourceTime: sourceTime || null,
      retrievedAt,
      validUntil: validUntil || null,
    };
  }

  return {
    status: 'fresh',
    ageMinutes,
    thresholdMinutes,
    reason: `Verified fresh: observed/generated ${ageMinutes}m ago, well within the ${thresholdMinutes}m validity window.`,
    sourceTime: sourceTime || null,
    retrievedAt,
    validUntil: validUntil || null,
  };
}
