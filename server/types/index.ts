export type SourceCategory = 'forecast' | 'observation' | 'official_advisory' | 'reanalysis';

export interface ClimateSource {
  id: string;
  name: string;
  category: SourceCategory;
  sourceUrl: string;
  attribution: string;
  geographicCoverage: string;
  updateFrequency: string;
  enabled: boolean;
  createdAt: string;
}

export type FreshnessStatus = 'fresh' | 'stale' | 'unknown' | 'expired';
export type CompletenessStatus = 'complete' | 'partial' | 'unknown';
export type DataOrigin = 'live_provider' | 'demonstration' | 'historical_archive';

export interface FreshnessAssessment {
  status: FreshnessStatus;
  ageMinutes: number | null;
  thresholdMinutes: number;
  reason: string;
  sourceTime: string | null;
  retrievedAt: string;
  validUntil: string | null;
}

export interface CompletenessAssessment {
  status: CompletenessStatus;
  missingFields: string[];
  totalExpectedFields: number;
  reason: string;
}

export interface EvidenceSnapshot {
  id: string;
  sourceId: string;
  sourceName?: string;
  dataType: 'weather_surface' | 'air_quality' | 'forecast_hourly' | 'advisory_bulletin';
  locationReference: string;
  latitude?: number;
  longitude?: number;
  canonicalPayload: string;
  sourceTimestamp: string | null;
  retrievedAt: string;
  validUntil: string | null;
  freshnessStatus: FreshnessStatus;
  freshnessReason: string;
  completenessStatus: CompletenessStatus;
  missingFields: string[];
  contentHash: string;
  dataOrigin: DataOrigin;
  previousSnapshotId: string | null;
  createdAt: string;
  proof?: IntegrityProof;
}

export interface IntegrityProof {
  id: string;
  evidenceSnapshotId: string;
  hashAlgorithm: 'SHA-256';
  registeredHash: string;
  proofType: 'local_cryptographic' | 'testnet_anchor' | 'public_bulletin';
  network?: string;
  transactionHash?: string;
  isSimulated?: boolean;
  isRealOnChain?: boolean;
  blockNumber?: number;
  onChainStatus?: 'unsubmitted_simulated' | 'on_chain_confirmed' | 'network_unreachable' | 'failed' | 'pending' | 'unverified_network_unavailable';
  statusNotice?: string;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'local_only';
  registeredAt: string;
  explorerUrl?: string;
}

export interface RefreshRun {
  id: string;
  sourceId: string;
  startedAt: string;
  completedAt: string | null;
  status: 'success' | 'failed' | 'partial' | 'timeout';
  errorCode?: string;
  errorMessage?: string;
  recordsRetrieved: number;
}

export interface EvidenceChange {
  id: string;
  evidenceSnapshotId: string;
  previousSnapshotId: string;
  changeType: 'value_shift' | 'timestamp_advance' | 'status_transition' | 'variance_alert';
  changeSummary: string;
  changedFields: Record<string, { previous: any; current: any }>;
  detectedAt: string;
}

export interface WeatherData {
  location: {
    label: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    country?: string;
  };
  source: {
    id: string;
    name: string;
    category: SourceCategory;
    url: string;
    attribution: string;
    model: string;
  };
  values: {
    temperature: number;
    apparentTemperature: number;
    relativeHumidity: number;
    precipitation: number;
    weatherCode: number;
    weatherDescription: string;
    windSpeed: number;
    surfacePressure: number;
    uvIndex?: number;
  };
  units: Record<string, string>;
  timestamps: {
    sourceTime: string;
    retrievedAt: string;
    validUntil?: string;
  };
  airQuality?: {
    europeanAqi: number;
    usAqi: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogenDioxide: number;
    statusLabel: string;
  };
  hourlyForecast: Array<{
    time: string;
    temperature: number;
    precipitationProbability: number;
    precipitation: number;
    windSpeed: number;
  }>;
  dailyForecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    uvIndexMax: number;
    weatherCode: number;
  }>;
  freshness: FreshnessAssessment;
  completeness: CompletenessAssessment;
  latestEvidenceId?: string;
  contentHash?: string;
}

export interface ClimateAlert {
  id: string;
  title: string;
  sourceName: string;
  sourceCategory: SourceCategory;
  officialFeedConnected: boolean;
  severity: 'advisory' | 'watch' | 'warning' | 'informational';
  areaDesc: string;
  headline: string;
  description: string;
  instruction: string;
  effectiveTime: string;
  expiresTime: string;
  retrievedAt: string;
  sourceUrl: string;
  isSimulatedDemo: boolean;
}

export interface ReadyPlanItem {
  id: string;
  category: 'extreme_heat' | 'heavy_rainfall' | 'household_readiness' | 'water_conservation' | 'everyday_awareness';
  categoryLabel: { en: string; ta: string };
  title: { en: string; ta: string };
  description: { en: string; ta: string };
  practicalSteps: { en: string[]; ta: string[] };
  safetyNotice: { en: string; ta: string };
  officialAuthorityRef: {
    name: string;
    url: string;
  };
}

// --- Climate Evidence Twin (Signature Feature) ---
export interface DerivedIndicator {
  name: string;
  value: number | string;
  unit?: string;
  category: string;
  severity: 'normal' | 'caution' | 'warning' | 'critical';
  methodology: string;
  thresholds: string;
  interpretation: string;
  limitations: string;
}

export interface ClimateEvidenceTwin {
  id: string;
  location: {
    label: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  timestamps: {
    createdUtc: string;
    retrievedAt: string;
    sourceObservationTime: string;
    validUntil?: string;
  };
  source: {
    provider: string;
    model: string;
    category: SourceCategory;
    attribution: string;
    sourceUrl: string;
  };
  measurements: {
    temperature: number;
    apparentTemperature: number;
    relativeHumidity: number;
    precipitation: number;
    windSpeed: number;
    surfacePressure: number;
    weatherCode: number;
    weatherDescription: string;
    uvIndex?: number;
  };
  airQuality?: {
    scale: 'US EPA AQI';
    usAqi: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogenDioxide: number;
    statusLabel: string;
    healthNotice: string;
  };
  derivedIndicators: {
    heatStress: DerivedIndicator;
    rainfallRisk: DerivedIndicator;
    thermalDiscomfort: DerivedIndicator;
    airQualityRisk?: DerivedIndicator;
  };
  qualityAssessment: {
    freshnessStatus: FreshnessStatus;
    freshnessReason: string;
    ageMinutes: number | null;
    completenessStatus: CompletenessStatus;
    completenessReason: string;
    missingFields: string[];
    temporalConsistency: boolean;
    consistencyNotes: string;
  };
  groundedExplanation?: {
    summary: string;
    keyDrivers: string[];
    uncertainties: string;
    language: 'en' | 'ta';
  };
  verification: {
    canonicalizationScheme: 'RFC 8785';
    canonicalPayload: string;
    hashAlgorithm: 'SHA-256';
    contentHash: string;
    proofType: 'local_cryptographic' | 'testnet_anchor' | 'public_bulletin';
    isMatch: boolean;
    blockchainStatus: 'local_only' | 'simulated_testnet' | 'real_onchain';
  };
  recommendedActions: string[];
}

// --- Climate Action Impact Ledger (Unique Feature) ---
export type ActionCategory =
  | 'heat_preparedness'
  | 'water_conservation'
  | 'rainfall_preparedness'
  | 'energy_efficiency'
  | 'waste_reduction'
  | 'tree_shade'
  | 'community_awareness';

export type ActionStatus = 'planned' | 'in_progress' | 'completed';

export interface ActionCryptographicReceipt {
  receiptId: string;
  actionId: string;
  actionTitle: string;
  completedAt: string;
  supportingEvidenceSnapshotId?: string;
  supportingEvidenceHash?: string;
  canonicalReceiptPayload: string;
  receiptSha256: string;
  disclaimer: string;
}

export interface ClimateAction {
  id: string;
  title: { en: string; ta: string };
  category: ActionCategory;
  intendedBeneficiary: string;
  locationContext: string;
  evidenceBasis: {
    snapshotId?: string;
    metric: string;
    observedValue: string;
    condition: string;
  };
  whyItMatters: { en: string; ta: string };
  difficulty: 'Low' | 'Medium' | 'High';
  estimatedCostCategory: 'Free / Zero-Cost' | 'Low ($)' | 'Moderate ($$)';
  timeframe: string;
  expectedBenefit: { en: string; ta: string };
  metricForProgress: string;
  methodology: string;
  status: ActionStatus;
  statusUpdatedAt: string;
  cryptographicReceipt?: ActionCryptographicReceipt;
}

// --- Community Climate Challenges ---
export interface CommunityChallenge {
  id: string;
  title: { en: string; ta: string };
  targetAudience: 'Schools & Colleges' | 'Residents & Neighborhoods' | 'Youth & Environmental NGOs';
  location: string;
  objective: { en: string; ta: string };
  startDate: string;
  endDate: string;
  measurementMethod: string;
  baseline: string;
  participantCount: number;
  progressPercentage: number;
  evidenceCount: number;
  completionCriteria: string;
  isDemoMode: boolean;
}

// --- Blockchain Configuration Status ---
export interface BlockchainStatus {
  isRealConfigured: boolean;
  networkName: string;
  chainId: number;
  rpcConfigured: boolean;
  signerConfigured: boolean;
  canVerifyReadOnly?: boolean;
  canSubmitTransactions?: boolean;
  currentMode: 'local_sha256' | 'simulated_testnet' | 'read_only_verification' | 'configured_ready' | 'real_onchain';
  contractAddress?: string;
  smartContractSource: string;
  setupInstructions: string[];
}
