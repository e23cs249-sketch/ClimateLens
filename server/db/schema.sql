-- ClimateLens SQLite Schema
-- IEEE ClimateChain Global Hackathon 2026 - Track 4
-- Evidence-to-Action Integrity Loop

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('forecast', 'observation', 'official_advisory', 'reanalysis')),
  source_url TEXT NOT NULL,
  attribution TEXT NOT NULL,
  geographic_coverage TEXT NOT NULL,
  update_frequency TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_snapshots (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  data_type TEXT NOT NULL CHECK(data_type IN ('weather_surface', 'air_quality', 'forecast_hourly', 'advisory_bulletin')),
  location_reference TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  canonical_payload TEXT NOT NULL,
  source_timestamp TEXT,
  retrieved_at TEXT NOT NULL,
  valid_until TEXT,
  freshness_status TEXT NOT NULL CHECK(freshness_status IN ('fresh', 'stale', 'unknown', 'expired')),
  freshness_reason TEXT,
  completeness_status TEXT NOT NULL CHECK(completeness_status IN ('complete', 'partial', 'unknown')),
  missing_fields TEXT,
  content_hash TEXT NOT NULL,
  data_origin TEXT NOT NULL CHECK(data_origin IN ('live_provider', 'demonstration', 'historical_archive')),
  previous_snapshot_id TEXT REFERENCES evidence_snapshots(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'partial', 'timeout')),
  error_code TEXT,
  error_message TEXT,
  records_retrieved INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS integrity_proofs (
  id TEXT PRIMARY KEY,
  evidence_snapshot_id TEXT NOT NULL REFERENCES evidence_snapshots(id),
  hash_algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  registered_hash TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK(proof_type IN ('local_cryptographic', 'testnet_anchor', 'public_bulletin')),
  network TEXT,
  transaction_hash TEXT,
  verification_status TEXT NOT NULL CHECK(verification_status IN ('verified', 'pending', 'failed', 'local_only')),
  registered_at TEXT NOT NULL,
  explorer_url TEXT
);

CREATE TABLE IF NOT EXISTS evidence_changes (
  id TEXT PRIMARY KEY,
  evidence_snapshot_id TEXT NOT NULL REFERENCES evidence_snapshots(id),
  previous_snapshot_id TEXT NOT NULL REFERENCES evidence_snapshots(id),
  change_type TEXT NOT NULL CHECK(change_type IN ('value_shift', 'timestamp_advance', 'status_transition', 'variance_alert')),
  change_summary TEXT NOT NULL,
  changed_fields TEXT NOT NULL,
  detected_at TEXT NOT NULL
);
