import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { fetchLiveWeatherData, searchLocations } from '../providers/weather.provider.ts';
import { createEvidenceSnapshotFromWeather } from '../services/evidence.service.ts';
import {
  verifyEvidenceSnapshot,
  verifyEvidenceSnapshotAsync,
  registerTestnetAnchor,
  getBlockchainStatus,
  verifyRawFilePayload,
} from '../services/blockchain.service.ts';
import { explainWeatherData } from '../services/explanation.service.ts';
import { getReadyPlanItems } from '../services/readyplan.service.ts';
import { getAlerts } from '../services/alerts.service.ts';
import { calculateSha256 } from '../utils/hashing.ts';
import { buildClimateEvidenceTwin } from '../services/twin.service.ts';
import { getAllActions, updateActionStatus, sealActionReceipt } from '../services/action.service.ts';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ClimateLens API',
    version: '1.0.0',
    hackathon: 'IEEE ClimateChain Global Hackathon 2026',
    track: 'Track 4 — Climate Data & Environmental Monitoring',
    integrityLoop: 'Real Data -> Provenance -> Quality Engine -> AI Explainer -> ReadyPlan -> SHA-256 Proof -> History',
  });
});

// Location geocoding search
router.get('/locations/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const results = await searchLocations(q);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'GEOCODING_ERROR', message: err.message } });
  }
});

// Live weather and atmospheric data
router.get('/weather', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 13.0827; // Default: Chennai, India
    const lon = parseFloat(req.query.lon as string) || 80.2707;
    const location = (req.query.location as string) || 'Chennai, Tamil Nadu, India';

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        error: { code: 'INVALID_COORDINATES', message: 'Latitude must be -90..90 and Longitude -180..180.' },
      });
    }

    const weather = await fetchLiveWeatherData(lat, lon, location);

    // Save refresh run
    db.saveRefreshRun({
      id: `ref-${Date.now()}`,
      sourceId: weather.source.id,
      startedAt: weather.timestamps.retrievedAt,
      completedAt: new Date().toISOString(),
      status: 'success',
      recordsRetrieved: 1,
    });

    res.json(weather);
  } catch (err: any) {
    db.saveRefreshRun({
      id: `ref-${Date.now()}`,
      sourceId: 'src-open-meteo',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'failed',
      errorCode: 'UPSTREAM_UNAVAILABLE',
      errorMessage: err.message,
      recordsRetrieved: 0,
    });

    res.status(502).json({
      error: {
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'External meteorological provider (Open-Meteo) temporarily unreachable or timed out.',
      },
    });
  }
});

// Sources registry
router.get('/sources', (_req: Request, res: Response) => {
  const sources = db.getSources();
  res.json(sources);
});

// Evidence snapshots list
router.get('/evidence', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const snapshots = db.getEvidenceSnapshots(limit);
  res.json(snapshots);
});

// Get single evidence snapshot by ID
router.get('/evidence/:id', (req: Request, res: Response) => {
  const snapshot = db.getEvidenceSnapshotById(req.params.id);
  if (!snapshot) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Evidence snapshot not found.' } });
  }
  res.json(snapshot);
});

// Capture new evidence snapshot
router.post('/evidence', async (req: Request, res: Response) => {
  try {
    const { weather, origin } = req.body;
    if (!weather || !weather.location || !weather.values) {
      return res.status(400).json({
        error: { code: 'INVALID_PAYLOAD', message: 'Valid weather data object required to seal evidence.' },
      });
    }

    const snapshot = createEvidenceSnapshotFromWeather(weather, origin || 'live_provider');
    res.status(201).json(snapshot);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SNAPSHOT_ERROR', message: err.message } });
  }
});

// Verify snapshot integrity with live on-chain re-verification when configured
router.post('/evidence/:id/verify', async (req: Request, res: Response) => {
  try {
    const result = await verifyEvidenceSnapshotAsync(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: { code: 'VERIFICATION_ERROR', message: err.message } });
  }
});

// Tampering demo: verify modified custom payload against snapshot hash
router.post('/evidence/:id/verify-custom', async (req: Request, res: Response) => {
  try {
    const { customPayload } = req.body;
    if (typeof customPayload !== 'string') {
      return res.status(400).json({
        error: { code: 'INVALID_PAYLOAD', message: 'customPayload string required for tamper test.' },
      });
    }
    const result = await verifyEvidenceSnapshotAsync(req.params.id, customPayload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'TAMPER_TEST_ERROR', message: err.message } });
  }
});

// Register on-chain testnet anchor
router.post('/evidence/:id/register-proof', async (req: Request, res: Response) => {
  try {
    const network = req.body.network || 'Polygon Amoy Testnet (Chain ID: 80002)';
    const proof = await registerTestnetAnchor(req.params.id, network);
    res.json(proof);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'PROOF_ERROR', message: err.message } });
  }
});

// History timeline
router.get('/history', (_req: Request, res: Response) => {
  const changes = db.getEvidenceChanges(50);
  const snapshots = db.getEvidenceSnapshots(25);
  res.json({
    changes,
    recentSnapshots: snapshots,
  });
});

// Alerts centre
router.get('/alerts', (_req: Request, res: Response) => {
  res.json(getAlerts());
});

// ReadyPlan
router.get('/ready-plan', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  res.json(getReadyPlanItems(category));
});

// AI Explanation
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { weather, language } = req.body;
    if (!weather || !weather.values) {
      return res.status(400).json({ error: { code: 'INVALID_WEATHER', message: 'Weather data required.' } });
    }
    const explanation = await explainWeatherData(weather, language === 'ta' ? 'ta' : 'en');
    res.json(explanation);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'EXPLANATION_ERROR', message: err.message } });
  }
});

// Compute custom hash
router.post('/hash', (req: Request, res: Response) => {
  try {
    const { payload } = req.body;
    const { hash, canonicalPayload } = calculateSha256(payload);
    res.json({ hash, canonicalPayload });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'HASHING_ERROR', message: err.message } });
  }
});

// --- Climate Evidence Twin Endpoint ---
router.get('/twin', async (req: Request, res: Response) => {
  try {
    const snapshotId = req.query.snapshotId as string | undefined;
    let snapshot = undefined;

    if (snapshotId) {
      snapshot = db.getEvidenceSnapshotById(snapshotId);
    }

    const lat = parseFloat(req.query.lat as string) || (snapshot?.latitude ?? 13.0827);
    const lon = parseFloat(req.query.lon as string) || (snapshot?.longitude ?? 80.2707);
    const location = (req.query.location as string) || (snapshot?.locationReference ?? 'Chennai, Tamil Nadu, India');

    const weather = await fetchLiveWeatherData(lat, lon, location);
    const twin = buildClimateEvidenceTwin(weather, snapshot);
    res.json(twin);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'TWIN_ERROR', message: err.message } });
  }
});

// --- Climate Action Impact Ledger Endpoints ---
router.get('/actions', (_req: Request, res: Response) => {
  res.json(getAllActions());
});

router.patch('/actions/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['planned', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: { code: 'INVALID_STATUS', message: 'Status must be planned, in_progress, or completed.' } });
    }
    const updated = updateActionStatus(req.params.id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: { code: 'ACTION_NOT_FOUND', message: err.message } });
  }
});

router.post('/actions/:id/receipt', (req: Request, res: Response) => {
  try {
    const sealed = sealActionReceipt(req.params.id);
    res.json(sealed);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'RECEIPT_ERROR', message: err.message } });
  }
});

// --- Community Challenges Endpoints ---
router.get('/challenges', (_req: Request, res: Response) => {
  res.json(db.getChallenges());
});

router.post('/challenges/:id/evidence', (req: Request, res: Response) => {
  try {
    const updated = db.recordChallengeEvidence(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: { code: 'CHALLENGE_NOT_FOUND', message: err.message } });
  }
});

// --- Blockchain Configuration Status Endpoint ---
router.get('/blockchain/status', (_req: Request, res: Response) => {
  res.json(getBlockchainStatus());
});

// --- Verify Raw File Upload Endpoint ---
router.post('/evidence/verify-file', (req: Request, res: Response) => {
  try {
    const { rawContent, claimedDigest } = req.body;
    if (typeof rawContent !== 'string') {
      return res.status(400).json({ error: { code: 'INVALID_FILE', message: 'rawContent string required.' } });
    }
    const report = verifyRawFilePayload(rawContent, claimedDigest);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'VERIFICATION_ERROR', message: err.message } });
  }
});

// --- Demo Mode Reset Endpoint ---
router.post('/demo/reset', (_req: Request, res: Response) => {
  db.resetDemoData();
  res.json({ status: 'ok', message: 'Demonstration dataset successfully reset to baseline.' });
});

export default router;
