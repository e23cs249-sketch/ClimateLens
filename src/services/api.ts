export interface LocationItem {
  id: string;
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface WeatherData {
  location: {
    label: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  source: {
    id: string;
    name: string;
    category: string;
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
  freshness: {
    status: 'fresh' | 'stale' | 'unknown' | 'expired';
    ageMinutes: number | null;
    thresholdMinutes: number;
    reason: string;
  };
  completeness: {
    status: 'complete' | 'partial' | 'unknown';
    missingFields: string[];
    totalExpectedFields: number;
    reason: string;
  };
  contentHash: string;
}

export interface EvidenceSnapshot {
  id: string;
  sourceId: string;
  sourceName?: string;
  dataType: string;
  locationReference: string;
  latitude?: number;
  longitude?: number;
  canonicalPayload: string;
  sourceTimestamp: string | null;
  retrievedAt: string;
  validUntil: string | null;
  freshnessStatus: string;
  freshnessReason: string;
  completenessStatus: string;
  missingFields: string[];
  contentHash: string;
  dataOrigin: string;
  previousSnapshotId: string | null;
  createdAt: string;
  proof?: {
    id: string;
    proofType: string;
    network?: string;
    transactionHash?: string;
    isSimulated?: boolean;
    isRealOnChain?: boolean;
    blockNumber?: number;
    onChainStatus?: 'unsubmitted_simulated' | 'on_chain_confirmed' | 'network_unreachable' | 'failed' | 'pending' | 'unverified_network_unavailable';
    statusNotice?: string;
    verificationStatus: string;
    registeredAt: string;
    explorerUrl?: string;
  };
}

export interface VerificationResult {
  evidenceId: string;
  originalRegisteredHash: string;
  recalculatedHash: string;
  isMatch: boolean;
  status: 'MATCH' | 'MISMATCH' | 'UNAVAILABLE';
  proofType: string;
  verificationTimestamp: string;
  payloadLengthBytes: number;
  explanation: string;
  blockchainProof?: {
    network: string;
    transactionHash?: string;
    isSimulated: boolean;
    isRealOnChain?: boolean;
    blockNumber?: number;
    anchorTimestamp: string;
    explorerUrl?: string;
    onChainStatus: 'unsubmitted_simulated' | 'on_chain_confirmed' | 'network_unreachable' | 'failed' | 'pending' | 'unverified_network_unavailable';
    statusNotice: string;
  };
}

export interface ExplanationResult {
  meaning: string;
  context: string;
  significance: string;
  sourceAttribution: string;
  uncertainties: string;
  recommendedActions: string[];
  providerUsed: 'gemini' | 'deterministic_fallback';
  language: 'en' | 'ta';
}

export interface EvidenceChange {
  id: string;
  evidenceSnapshotId: string;
  previousSnapshotId: string;
  changeType: string;
  changeSummary: string;
  changedFields: Record<string, { previous: any; current: any }>;
  detectedAt: string;
}

export interface ReadyPlanItem {
  id: string;
  category: string;
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

const API_BASE = '/api/v1';

export async function fetchWeather(lat: number, lon: number, location: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    location,
  });
  const res = await fetch(`${API_BASE}/weather?${params}`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `Failed to fetch weather: ${res.status}`);
  }
  return res.json();
}

export async function searchLocationsApi(query: string): Promise<LocationItem[]> {
  const res = await fetch(`${API_BASE}/locations/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchEvidenceSnapshots(): Promise<EvidenceSnapshot[]> {
  const res = await fetch(`${API_BASE}/evidence`);
  if (!res.ok) throw new Error('Failed to fetch evidence list');
  return res.json();
}

export async function fetchEvidenceSnapshotById(id: string): Promise<EvidenceSnapshot> {
  const res = await fetch(`${API_BASE}/evidence/${id}`);
  if (!res.ok) throw new Error('Snapshot not found');
  return res.json();
}

export async function captureEvidenceSnapshot(weather: WeatherData): Promise<EvidenceSnapshot> {
  const res = await fetch(`${API_BASE}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weather, origin: 'live_provider' }),
  });
  if (!res.ok) throw new Error('Failed to seal evidence snapshot');
  return res.json();
}

export async function verifySnapshotApi(snapshotId: string): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/evidence/${snapshotId}/verify`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}

export async function verifyCustomPayloadApi(
  snapshotId: string,
  customPayload: string
): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/evidence/${snapshotId}/verify-custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customPayload }),
  });
  if (!res.ok) throw new Error('Tamper verification test failed');
  return res.json();
}

export async function registerTestnetProofApi(snapshotId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/evidence/${snapshotId}/register-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ network: 'Polygon Amoy Testnet (Chain ID: 80002)' }),
  });
  if (!res.ok) throw new Error('Failed to register on-chain proof');
  return res.json();
}

export async function fetchHistoryApi(): Promise<{
  changes: EvidenceChange[];
  recentSnapshots: EvidenceSnapshot[];
}> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchAlertsApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchReadyPlanApi(): Promise<ReadyPlanItem[]> {
  const res = await fetch(`${API_BASE}/ready-plan`);
  if (!res.ok) throw new Error('Failed to fetch ReadyPlan items');
  return res.json();
}

export async function fetchSourcesApi(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

export async function requestExplanationApi(weather: WeatherData, language: 'en' | 'ta'): Promise<ExplanationResult> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weather, language }),
  });
  if (!res.ok) throw new Error('Failed to generate explanation');
  return res.json();
}

// --- Extended Climate Evidence Twin Types & Client ---
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
    category: string;
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
    freshnessStatus: string;
    freshnessReason: string;
    ageMinutes: number | null;
    completenessStatus: string;
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
    proofType: string;
    isMatch: boolean;
    blockchainStatus: 'local_only' | 'simulated_testnet' | 'real_onchain';
  };
  recommendedActions: string[];
}

export async function fetchClimateTwinApi(lat: number, lon: number, location: string, snapshotId?: string): Promise<ClimateEvidenceTwin> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    location,
  });
  if (snapshotId) {
    params.set('snapshotId', snapshotId);
  }
  const res = await fetch(`${API_BASE}/twin?${params}`);
  if (!res.ok) throw new Error('Failed to retrieve Climate Evidence Twin');
  return res.json();
}

// --- Climate Action Impact Ledger Types & Client ---
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

export type ActionStatus = 'planned' | 'in_progress' | 'completed';

export interface ClimateAction {
  id: string;
  title: { en: string; ta: string };
  category: 'heat_preparedness' | 'water_conservation' | 'rainfall_preparedness' | 'energy_efficiency' | 'waste_reduction' | 'tree_shade' | 'community_awareness';
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
  status: 'planned' | 'in_progress' | 'completed';
  statusUpdatedAt: string;
  cryptographicReceipt?: ActionCryptographicReceipt;
}

export async function fetchActionsApi(): Promise<ClimateAction[]> {
  const res = await fetch(`${API_BASE}/actions`);
  if (!res.ok) throw new Error('Failed to fetch climate actions');
  return res.json();
}

export async function updateActionStatusApi(id: string, status: 'planned' | 'in_progress' | 'completed'): Promise<ClimateAction> {
  const res = await fetch(`${API_BASE}/actions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update action status');
  return res.json();
}

export async function sealActionReceiptApi(id: string): Promise<ClimateAction> {
  const res = await fetch(`${API_BASE}/actions/${id}/receipt`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate cryptographic receipt');
  return res.json();
}

// --- Community Challenges Types & Client ---
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

export async function fetchChallengesApi(): Promise<CommunityChallenge[]> {
  const res = await fetch(`${API_BASE}/challenges`);
  if (!res.ok) throw new Error('Failed to fetch community challenges');
  return res.json();
}

export async function recordChallengeEvidenceApi(id: string): Promise<CommunityChallenge> {
  const res = await fetch(`${API_BASE}/challenges/${id}/evidence`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to record participant evidence');
  return res.json();
}

// --- Blockchain Status & Raw File Verification ---
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

export async function fetchBlockchainStatusApi(): Promise<BlockchainStatus> {
  const res = await fetch(`${API_BASE}/blockchain/status`);
  if (!res.ok) throw new Error('Failed to fetch blockchain configuration status');
  return res.json();
}

export async function verifyRawFileApi(rawContent: string, claimedDigest?: string): Promise<{
  isMatch: boolean;
  status: 'MATCH' | 'MISMATCH' | 'UNVERIFIABLE';
  recalculatedHash: string;
  claimedDigest: string | null;
  explanation: string;
}> {
  const res = await fetch(`${API_BASE}/evidence/verify-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent, claimedDigest }),
  });
  if (!res.ok) throw new Error('Failed to verify raw file');
  return res.json();
}

export async function resetDemoDataApi(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo dataset');
  return res.json();
}
