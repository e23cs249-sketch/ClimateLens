import { db } from '../db/database.ts';
import { ClimateAction, ActionStatus, ActionCryptographicReceipt } from '../types/index.ts';
import { canonicalize } from '../utils/canonicalize.ts';
import { calculateSha256 } from '../utils/hashing.ts';

export function getAllActions(): ClimateAction[] {
  return db.getActions();
}

export function updateActionStatus(id: string, status: ActionStatus): ClimateAction {
  return db.updateActionStatus(id, status);
}

export function sealActionReceipt(id: string): ClimateAction {
  const action = db.getActionById(id);
  if (!action) {
    throw new Error(`Cannot seal receipt: Action '${id}' not found.`);
  }

  const completedAt = new Date().toISOString();
  const receiptId = `rcpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // Find latest evidence snapshot to link
  const snapshots = db.getEvidenceSnapshots(1);
  const supportingEvidenceSnapshotId = snapshots.length > 0 ? snapshots[0].id : undefined;
  const supportingEvidenceHash = snapshots.length > 0 ? snapshots[0].contentHash : 'GENESIS_EVIDENCE_DIGEST';

  const receiptPayloadObject = {
    receiptId,
    actionId: action.id,
    actionTitle: action.title.en,
    category: action.category,
    location: action.locationContext,
    completedAt,
    supportingEvidenceSnapshotId,
    supportingEvidenceHash,
    metricForProgress: action.metricForProgress,
    status: 'completed',
  };

  const canonicalReceiptPayload = canonicalize(receiptPayloadObject);
  const { hash: receiptSha256 } = calculateSha256(canonicalReceiptPayload);

  const receipt: ActionCryptographicReceipt = {
    receiptId,
    actionId: action.id,
    actionTitle: action.title.en,
    completedAt,
    supportingEvidenceSnapshotId,
    supportingEvidenceHash,
    canonicalReceiptPayload,
    receiptSha256,
    disclaimer:
      'User-Reported Action Completion: This cryptographic receipt proves that this specific action record has remained unaltered since generation. It certifies digital data integrity of the user-reported completion; it does not replace independent on-ground physical inspection or verified environmental sensor impact.',
  };

  return db.saveActionReceipt(id, receipt);
}
