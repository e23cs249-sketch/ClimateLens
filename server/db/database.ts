import fs from 'fs';
import path from 'path';
import {
  ClimateSource,
  EvidenceSnapshot,
  IntegrityProof,
  RefreshRun,
  EvidenceChange,
  ClimateAction,
  CommunityChallenge,
} from '../types/index.ts';

interface DatabaseState {
  sources: ClimateSource[];
  evidence_snapshots: EvidenceSnapshot[];
  integrity_proofs: IntegrityProof[];
  refresh_runs: RefreshRun[];
  evidence_changes: EvidenceChange[];
  actions: ClimateAction[];
  challenges: CommunityChallenge[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'climatelens.json');

const INITIAL_SOURCES: ClimateSource[] = [
  {
    id: 'src-open-meteo',
    name: 'Open-Meteo Weather Model Suite',
    category: 'forecast',
    sourceUrl: 'https://open-meteo.com',
    attribution: 'Weather data provided by Open-Meteo under CC BY 4.0 (models: ECMWF IFS, DWD ICON, GFS)',
    geographicCoverage: 'Global (90°N - 90°S, 180°W - 180°E at 0.1° resolution)',
    updateFrequency: 'Hourly (model cycles refreshed every 1 to 3 hours)',
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'src-copernicus-era5',
    name: 'Copernicus Climate Change Service (ERA5)',
    category: 'reanalysis',
    sourceUrl: 'https://climate.copernicus.eu',
    attribution: 'Contains modified Copernicus Climate Change Service information (2026)',
    geographicCoverage: 'Global atmosphere, land surface, and ocean wave historical reanalysis',
    updateFrequency: 'Monthly consolidated reanalysis with 5-day preliminary release',
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'src-imd-official',
    name: 'India Meteorological Department (IMD) Reference Portal',
    category: 'official_advisory',
    sourceUrl: 'https://mausam.imd.gov.in',
    attribution: 'Ministry of Earth Sciences, Government of India (Official Portal Reference)',
    geographicCoverage: 'National / South Asia regional sub-divisions and meteorological zones',
    updateFrequency: 'Official bulletins issued 4x daily (0300, 0830, 1130, 1730 IST)',
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_ACTIONS: ClimateAction[] = [
  {
    id: 'act-chennai-heat-01',
    title: {
      en: 'Deploy Shaded Hydration Points at High-Traffic Transit Hubs',
      ta: 'அதிக நடமாட்டம் உள்ள போக்குவரத்து மையங்களில் நிழல் மற்றும் நீர் பந்தல்கள் அமைத்தல்',
    },
    category: 'heat_preparedness',
    intendedBeneficiary: 'Transit Commuters, Outdoor Delivery Workers, and Street Vendors',
    locationContext: 'Chennai Central, Guindy, and Koyambedu Junctions',
    evidenceBasis: {
      metric: 'Apparent Temperature',
      observedValue: '34.8°C (Humidex Range)',
      condition: 'Thermal index consistently exceeds safe sustained outdoor exertion threshold (>32°C)',
    },
    whyItMatters: {
      en: 'In high coastal humidity, sweat cannot evaporate efficiently. Ambient 32°C feels like 38°C+, tripling acute heat-exhaustion incidence among outdoor workers.',
      ta: 'கடலோர ஈரப்பதம் காரணமாக வியர்வை எளிதில் ஆவியாகாது. 32°C வெப்பநிலை 38°C ஆக உணரப்பட்டு, தொழிலாளர்களுக்கு வெப்ப மயக்கம் ஏற்படுத்தும்.',
    },
    difficulty: 'Low',
    estimatedCostCategory: 'Low ($)',
    timeframe: 'Immediate (24 - 48 Hours)',
    expectedBenefit: {
      en: 'Prevents acute dehydration and heat syncope for an estimated 4,000+ daily pedestrians during peak solar hours (11:30 AM - 3:30 PM).',
      ta: 'நண்பகல் நேரங்களில் 4,000+ பொதுமக்களுக்கு நீர்ச்சத்து குறைவு மற்றும் வெப்ப மயக்கத்தை தடுக்கிறது.',
    },
    metricForProgress: 'Operational shaded kiosks with clean drinking water verified by community spot-checks',
    methodology: 'National Disaster Management Authority (NDMA) Heat Wave Action Guidelines 2024',
    status: 'completed',
    statusUpdatedAt: '2026-10-21T06:30:00.000Z',
    cryptographicReceipt: {
      receiptId: 'rcpt-heat-01',
      actionId: 'act-chennai-heat-01',
      actionTitle: 'Deploy Shaded Hydration Points at High-Traffic Transit Hubs',
      completedAt: '2026-10-21T06:30:00.000Z',
      supportingEvidenceHash: '9a31a986cb00fbfd53ff9d1078693c0bc133a8cf828114624d62e7aa2727181c',
      canonicalReceiptPayload: '{"actionId":"act-chennai-heat-01","completedAt":"2026-10-21T06:30:00.000Z","evidenceHash":"9a31a986cb00fbfd53ff9d1078693c0bc133a8cf828114624d62e7aa2727181c","location":"Chennai Central","status":"completed"}',
      receiptSha256: 'e814a0bc425894f27df7a1e0b5f190e2bce6285ad1b4a9efbb9e728471e95fae',
      disclaimer: 'This receipt cryptographically guarantees that this action record has not been altered since generation. It does not replace on-ground physical inspection.',
    },
  },
  {
    id: 'act-chennai-roof-02',
    title: {
      en: 'High-Albedo Cool Roof Coating for Residential Slums and Schools',
      ta: 'குடியிருப்புகள் மற்றும் பள்ளிகளுக்கு வெப்பத்தை எதிரொலிக்கும் கூரை பூச்சு',
    },
    category: 'energy_efficiency',
    intendedBeneficiary: 'Vulnerable Low-Income Households without Air Conditioning',
    locationContext: 'Vyasarapadi and Perambur Neighborhoods, North Chennai',
    evidenceBasis: {
      metric: 'Surface Solar Irradiance & Indoor Heat',
      observedValue: 'UV Index 8.2 & 33.5°C Ambient',
      condition: 'Uninsulated tin/asbestos sheet roofing elevates indoor temperatures up to 6°C above ambient air.',
    },
    whyItMatters: {
      en: 'High-reflectance solar coatings (albedo > 0.70) reflect 80% of incoming solar radiation, dropping indoor ambient temps by 3.5°C to 5.0°C without power consumption.',
      ta: 'சூரிய கதிர்வீச்சை 80% எதிரொலிப்பதன் மூலம் உட்புற வெப்பநிலையை மின்சார பயன்பாடு இன்றி 3.5°C முதல் 5.0°C வரை குறைக்கிறது.',
    },
    difficulty: 'Medium',
    estimatedCostCategory: 'Moderate ($$)',
    timeframe: 'Medium Term (1 - 2 Weeks)',
    expectedBenefit: {
      en: 'Reduces indoor heat stress and nocturnal heat retention for 120+ households; mitigates urban heat island effect.',
      ta: '120+ குடும்பங்களுக்கு உட்புற வெப்ப தாக்கத்தை குறைக்கிறது; நகர்ப்புற வெப்ப தீவு விளைவை மட்டுப்படுத்துகிறது.',
    },
    metricForProgress: 'Square meters of high-albedo solar coating applied and verified with pre/post infrared thermometer readings',
    methodology: 'Ahmedabad & Telangana Cool Roof Policy Benchmark Guidelines',
    status: 'in_progress',
    statusUpdatedAt: '2026-10-20T14:15:00.000Z',
  },
  {
    id: 'act-chennai-rain-03',
    title: {
      en: 'Clean Debris from Stormwater Grates & Rainwater Inlets Prior to Monsoon Onset',
      ta: 'மழைக்காலத்திற்கு முன் மழைநீர் வடிகால் மற்றும் சேகரிப்பு தொட்டிகளில் குப்பைகளை அகற்றுதல்',
    },
    category: 'rainfall_preparedness',
    intendedBeneficiary: 'Velachery, Madipakkam, and Pallikaranai Flood-Prone Catchments',
    locationContext: 'South Chennai Catchment Basin & Micro-Canals',
    evidenceBasis: {
      metric: 'Precipitation Screening Threshold',
      observedValue: 'Current 0.0mm; Season Forecast: NE Monsoon Inflow',
      condition: 'Pre-monsoon clearance is critical before convective rainfall events exceed 25mm/hr percolation limits.',
    },
    whyItMatters: {
      en: 'Over 65% of localized street-level waterlogging in flat coastal plains is initiated by plastic debris blocking kerb inlets, reducing hydraulic discharge capacity by 80%.',
      ta: 'வடிகால்களில் பிளாஸ்டிக் அடைப்பதால் நீர் வெளியேறும் வேகம் 80% குறைகிறது, இதுவே சாலைகளில் வெள்ளம் தேங்க முக்கிய காரணமாகிறது.',
    },
    difficulty: 'Medium',
    estimatedCostCategory: 'Free / Zero-Cost',
    timeframe: 'Immediate (Next 72 Hours)',
    expectedBenefit: {
      en: 'Ensures unimpeded gravity drainage during high-intensity tropical downpours; protects ground-floor residents.',
      ta: 'கனமழையின் போது வெள்ள நீர் தடையின்றி வடிய உதவுகிறது; தரைத்தள குடியிருப்பாளர்களை பாதுகாக்கிறது.',
    },
    metricForProgress: 'Number of cleared storm grates documented with timestamped geo-referenced photos',
    methodology: 'Greater Chennai Corporation (GCC) Pre-Monsoon Preparedness Protocol',
    status: 'planned',
    statusUpdatedAt: '2026-10-21T04:00:00.000Z',
  },
  {
    id: 'act-chennai-tree-04',
    title: {
      en: 'Urban Shade Mapping and Native Miyawaki Micro-Forest Planting',
      ta: 'நகர்ப்புற நிழல் வரைபடமாக்கல் மற்றும் நாட்டு மரங்கள் அடர்வனம் வளர்ப்பு',
    },
    category: 'tree_shade',
    intendedBeneficiary: 'Urban School Children and Active Pedestrians',
    locationContext: 'Sholinganallur IT Corridor & Velachery Inner Ring Road',
    evidenceBasis: {
      metric: 'Satellite Thermal Surface Differential',
      observedValue: '+4.2°C Urban Heat Island Delta vs Coastal Baseline',
      condition: 'Dense asphalt surface lacks vegetative canopy cover (<8% tree shade in surveyed quadrant)',
    },
    whyItMatters: {
      en: 'Mature native trees (Neem, Pongamia, Peepal) provide natural evaporative cooling, lowering ambient micro-temperatures by 2°C to 4°C at ground level.',
      ta: 'நாட்டு மரங்கள் (வேம்பு, புங்கை, அரசு) இயற்கையான குளிர்ச்சியை வழங்கி, தரைமட்ட வெப்பநிலையை 2°C முதல் 4°C வரை குறைக்கின்றன.',
    },
    difficulty: 'High',
    estimatedCostCategory: 'Moderate ($$)',
    timeframe: 'Ongoing Seasonal Campaign',
    expectedBenefit: {
      en: 'Sequestering localized particulate matter (PM2.5/PM10), increasing soil water infiltration, and restoring natural shade.',
      ta: 'காற்றிலுள்ள தூசுகளைக் குறைத்து, நிலத்தடி நீர் செறிவூட்டலை அதிகரித்து, இயற்கை நிழலை வழங்குகிறது.',
    },
    metricForProgress: 'Number of native saplings planted with 90-day survival tracking via community audit',
    methodology: 'Tamil Nadu Green Mission & Urban Forestry Standards',
    status: 'in_progress',
    statusUpdatedAt: '2026-10-19T09:00:00.000Z',
  },
];

const INITIAL_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'chg-chennai-shade-01',
    title: {
      en: 'Greater Chennai Shaded Pedestrian Corridor Audit',
      ta: 'கிரேட்டர் சென்னை பாதசாரி நிழல் வழித்தட தணிக்கை',
    },
    targetAudience: 'Schools & Colleges',
    location: 'Chennai (Anna Nagar, T. Nagar, Adyar, Velachery)',
    objective: {
      en: 'Student teams survey bus stops, school walk-routes, and pedestrian pathways to identify unshaded thermal hotspots requiring tree canopies or transit shelters.',
      ta: 'மாணவர்கள் பேருந்து நிறுத்தங்கள் மற்றும் பள்ளி நடைபாதைகளில் நிழல் இல்லாத பகுதிகளை அடையாளம் கண்டு அறிக்கை சமர்ப்பித்தல்.',
    },
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    measurementMethod: 'Thermometer surface surveys & photo-audit logs using ClimateLens mobile interface',
    baseline: '18% pedestrian shade coverage across survey zones',
    participantCount: 142,
    progressPercentage: 68,
    evidenceCount: 84,
    completionCriteria: '500 km of urban pedestrian pathways audited with verified coordinate markers',
    isDemoMode: true,
  },
  {
    id: 'chg-chennai-energy-02',
    title: {
      en: 'Campus Peak Hour Energy Load Shift Challenge',
      ta: 'கல்லூரி வளாக உச்சநேர மின்சார சுமை குறைப்பு சவால்',
    },
    targetAudience: 'Schools & Colleges',
    location: 'Participating Engineering & Arts Colleges, Tamil Nadu',
    objective: {
      en: 'Reduce non-essential HVAC and lighting load between 2:00 PM and 5:00 PM during extreme heat grid stress windows.',
      ta: 'கடும் வெப்ப நேரங்களில் (பிற்பகல் 2:00 - 5:00) தேவையற்ற மின்சார பயன்பாட்டை குறைத்தல்.',
    },
    startDate: '2026-10-10',
    endDate: '2026-10-31',
    measurementMethod: 'Smart meter delta logs & classroom energy ambassador logs',
    baseline: 'Average 1,250 kWh afternoon peak load per campus',
    participantCount: 380,
    progressPercentage: 45,
    evidenceCount: 36,
    completionCriteria: 'Minimum 15% reduction in afternoon peak energy consumption over 10 consecutive working days',
    isDemoMode: true,
  },
  {
    id: 'chg-chennai-water-03',
    title: {
      en: 'Neighborhood Rainwater Percolation Well Integrity Check',
      ta: 'குடியிருப்பு மழைநீர் சேகரிப்பு கட்டமைப்பு சரிபார்ப்பு இயக்கம்',
    },
    targetAudience: 'Residents & Neighborhoods',
    location: 'Residential Welfare Associations across South Chennai',
    objective: {
      en: 'Inspect household and apartment rainwater recharge pits to ensure sand/gravel filter beds are de-silted before monsoon showers.',
      ta: 'மழைக்காலம் தொடங்கும் முன் குடியிருப்பு பகுதிகளில் மழைநீர் சேகரிப்பு தொட்டிகளை தூர்வாரி சுத்தம் செய்தல்.',
    },
    startDate: '2026-10-15',
    endDate: '2026-11-05',
    measurementMethod: 'Community checklist verification with photographic before/after log',
    baseline: '42% of visited pits exhibited silt clogging or filter bypass',
    participantCount: 95,
    progressPercentage: 32,
    evidenceCount: 28,
    completionCriteria: '150 apartment complexes with functional, clean rainwater percolation structures',
    isDemoMode: true,
  },
];

class Database {
  private state: DatabaseState;

  constructor() {
    this.ensureDirectory();
    this.state = this.loadState();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadState(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          sources: parsed.sources || INITIAL_SOURCES,
          evidence_snapshots: parsed.evidence_snapshots || [],
          integrity_proofs: parsed.integrity_proofs || [],
          refresh_runs: parsed.refresh_runs || [],
          evidence_changes: parsed.evidence_changes || [],
          actions: parsed.actions && parsed.actions.length > 0 ? parsed.actions : INITIAL_ACTIONS,
          challenges: parsed.challenges && parsed.challenges.length > 0 ? parsed.challenges : INITIAL_CHALLENGES,
        };
      } catch (err) {
        console.error('Error reading database file, resetting to defaults:', err);
      }
    }

    const defaultState: DatabaseState = {
      sources: INITIAL_SOURCES,
      evidence_snapshots: [],
      integrity_proofs: [],
      refresh_runs: [],
      evidence_changes: [],
      actions: INITIAL_ACTIONS,
      challenges: INITIAL_CHALLENGES,
    };
    this.persist(defaultState);
    return defaultState;
  }

  private persist(state: DatabaseState) {
    this.ensureDirectory();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Sources ---
  getSources(): ClimateSource[] {
    return [...this.state.sources];
  }

  getSourceById(id: string): ClimateSource | undefined {
    return this.state.sources.find((s) => s.id === id);
  }

  // --- Evidence Snapshots ---
  getEvidenceSnapshots(limit = 50): EvidenceSnapshot[] {
    const list = [...this.state.evidence_snapshots].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return list.slice(0, limit);
  }

  getEvidenceSnapshotById(id: string): EvidenceSnapshot | undefined {
    const snapshot = this.state.evidence_snapshots.find((s) => s.id === id);
    if (!snapshot) return undefined;
    const proof = this.state.integrity_proofs.find((p) => p.evidenceSnapshotId === id);
    return {
      ...snapshot,
      proof,
    };
  }

  getLatestSnapshotForLocation(locationReference: string, dataType: string): EvidenceSnapshot | undefined {
    return this.state.evidence_snapshots
      .filter((s) => s.locationReference === locationReference && s.dataType === dataType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  saveEvidenceSnapshot(snapshot: EvidenceSnapshot): EvidenceSnapshot {
    // Check if snapshot ID already exists
    const index = this.state.evidence_snapshots.findIndex((s) => s.id === snapshot.id);
    if (index >= 0) {
      this.state.evidence_snapshots[index] = snapshot;
    } else {
      this.state.evidence_snapshots.unshift(snapshot);
    }
    this.persist(this.state);
    return snapshot;
  }

  // --- Integrity Proofs ---
  getProofBySnapshotId(snapshotId: string): IntegrityProof | undefined {
    return this.state.integrity_proofs.find((p) => p.evidenceSnapshotId === snapshotId);
  }

  saveIntegrityProof(proof: IntegrityProof): IntegrityProof {
    const index = this.state.integrity_proofs.findIndex(
      (p) => p.id === proof.id || p.evidenceSnapshotId === proof.evidenceSnapshotId
    );
    if (index >= 0) {
      this.state.integrity_proofs[index] = proof;
    } else {
      this.state.integrity_proofs.unshift(proof);
    }
    this.persist(this.state);
    return proof;
  }

  // --- Refresh Runs ---
  getRefreshRuns(limit = 20): RefreshRun[] {
    return [...this.state.refresh_runs]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  saveRefreshRun(run: RefreshRun): RefreshRun {
    this.state.refresh_runs.unshift(run);
    if (this.state.refresh_runs.length > 100) {
      this.state.refresh_runs = this.state.refresh_runs.slice(0, 100);
    }
    this.persist(this.state);
    return run;
  }

  // --- Evidence Changes ---
  getEvidenceChanges(limit = 50): EvidenceChange[] {
    return [...this.state.evidence_changes]
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      .slice(0, limit);
  }

  saveEvidenceChange(change: EvidenceChange): EvidenceChange {
    this.state.evidence_changes.unshift(change);
    this.persist(this.state);
    return change;
  }

  // --- Climate Actions Ledger (Unique Feature) ---
  getActions(): ClimateAction[] {
    return [...this.state.actions];
  }

  getActionById(id: string): ClimateAction | undefined {
    return this.state.actions.find((a) => a.id === id);
  }

  updateActionStatus(id: string, status: 'planned' | 'in_progress' | 'completed'): ClimateAction {
    const action = this.state.actions.find((a) => a.id === id);
    if (!action) {
      throw new Error(`Climate action with ID '${id}' not found.`);
    }
    action.status = status;
    action.statusUpdatedAt = new Date().toISOString();
    this.persist(this.state);
    return action;
  }

  saveActionReceipt(id: string, receipt: any): ClimateAction {
    const action = this.state.actions.find((a) => a.id === id);
    if (!action) {
      throw new Error(`Climate action with ID '${id}' not found.`);
    }
    action.status = 'completed';
    action.statusUpdatedAt = new Date().toISOString();
    action.cryptographicReceipt = receipt;
    this.persist(this.state);
    return action;
  }

  // --- Community Climate Challenges ---
  getChallenges(): CommunityChallenge[] {
    return [...this.state.challenges];
  }

  getChallengeById(id: string): CommunityChallenge | undefined {
    return this.state.challenges.find((c) => c.id === id);
  }

  recordChallengeEvidence(challengeId: string): CommunityChallenge {
    const challenge = this.state.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      throw new Error(`Challenge with ID '${challengeId}' not found.`);
    }
    challenge.evidenceCount += 1;
    challenge.participantCount += 1;
    if (challenge.progressPercentage < 100) {
      challenge.progressPercentage = Math.min(100, challenge.progressPercentage + 2);
    }
    this.persist(this.state);
    return challenge;
  }

  // --- Demonstration Reset Functionality ---
  resetDemoData(): void {
    this.state.actions = JSON.parse(JSON.stringify(INITIAL_ACTIONS));
    this.state.challenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
    this.persist(this.state);
  }
}

export const db = new Database();
