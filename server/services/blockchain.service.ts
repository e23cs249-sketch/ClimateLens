import crypto from 'crypto';
import { ethers } from 'ethers';
import { db } from '../db/database.ts';
import { IntegrityProof, BlockchainStatus, EvidenceSnapshot } from '../types/index.ts';

export interface VerificationReport {
  evidenceId: string;
  originalRegisteredHash: string;
  recalculatedHash: string;
  isMatch: boolean;
  status: 'MATCH' | 'MISMATCH' | 'UNVERIFIABLE';
  proofType: 'local_cryptographic' | 'testnet_anchor' | 'public_bulletin';
  verificationTimestamp: string;
  payloadLengthBytes: number;
  explanation: string;
  blockchainProof?: {
    network: string;
    transactionHash?: string;
    isSimulated: boolean;
    isRealOnChain: boolean;
    blockNumber?: number;
    anchorTimestamp: string;
    explorerUrl?: string;
    onChainStatus: 'unsubmitted_simulated' | 'on_chain_confirmed' | 'network_unreachable' | 'failed' | 'pending' | 'unverified_network_unavailable';
    statusNotice: string;
  };
}

export const SOLIDITY_CONTRACT_SOURCE = `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ClimateEvidenceAnchor
 * @author ClimateLens Engineering Team (IEEE ClimateChain Global Hackathon 2026)
 * @notice Anchors deterministic RFC 8785 SHA-256 climate evidence digests on Polygon Amoy.
 * @dev Provides immutable public timestamping and verification for environmental evidence snapshots.
 */
contract ClimateEvidenceAnchor {
    address public immutable owner;

    struct AnchorRecord {
        bytes32 evidenceHash;
        string locationLabel;
        uint256 timestamp;
        address registeredBy;
    }

    mapping(bytes32 => AnchorRecord) public records;

    event EvidenceAnchored(
        bytes32 indexed evidenceHash,
        string locationLabel,
        uint256 indexed timestamp,
        address indexed registeredBy
    );

    constructor() {
        owner = msg.sender;
    }

    function anchorEvidence(bytes32 _evidenceHash, string calldata _locationLabel) external {
        require(_evidenceHash != bytes32(0), "Invalid empty evidence hash");
        require(records[_evidenceHash].timestamp == 0, "Evidence hash already registered on-chain");
        
        records[_evidenceHash] = AnchorRecord({
            evidenceHash: _evidenceHash,
            locationLabel: _locationLabel,
            timestamp: block.timestamp,
            registeredBy: msg.sender
        });

        emit EvidenceAnchored(_evidenceHash, _locationLabel, block.timestamp, msg.sender);
    }

    function verifyEvidence(bytes32 _evidenceHash)
        external
        view
        returns (bool isAnchored, uint256 timestamp, string memory locationLabel)
    {
        AnchorRecord memory record = records[_evidenceHash];
        if (record.timestamp == 0) {
            return (false, 0, "");
        }
        return (true, record.timestamp, record.locationLabel);
    }
}`;

export const ANCHOR_CONTRACT_ABI = [
  'event EvidenceAnchored(bytes32 indexed evidenceHash, string locationLabel, uint256 indexed timestamp, address indexed registeredBy)',
  'function anchorEvidence(bytes32 _evidenceHash, string calldata _locationLabel) external',
  'function verifyEvidence(bytes32 _evidenceHash) external view returns (bool isAnchored, uint256 timestamp, string memory locationLabel)',
  'function owner() external view returns (address)',
  'function records(bytes32) external view returns (bytes32 evidenceHash, string memory locationLabel, uint256 timestamp, address registeredBy)',
];

export interface EvmConfig {
  isConfigured: boolean;
  canVerifyReadOnly?: boolean;
  canSubmitTransactions?: boolean;
  rpcUrl?: string;
  contractAddress?: string;
  privateKey?: string;
  chainId: number;
}

/**
 * Consistently retrieves and normalizes EVM configuration from environment variables.
 * Prioritizes standard names: EVM_RPC_URL, EVM_CONTRACT_ADDRESS, EVM_PRIVATE_KEY, EVM_CHAIN_ID.
 * Safely accepts documented aliases (POLYGON_AMOY_RPC_URL, ETHEREUM_PRIVATE_KEY, CLIMATE_ANCHOR_CONTRACT_ADDRESS).
 */
export function getEvmConfig(): EvmConfig {
  const rpcUrl = process.env.EVM_RPC_URL || process.env.POLYGON_AMOY_RPC_URL;
  const contractAddress = process.env.EVM_CONTRACT_ADDRESS || process.env.CLIMATE_ANCHOR_CONTRACT_ADDRESS;
  const privateKey = process.env.EVM_PRIVATE_KEY || process.env.ETHEREUM_PRIVATE_KEY;
  const chainId = parseInt(process.env.EVM_CHAIN_ID || '80002', 10);

  const canVerifyReadOnly = Boolean(
    rpcUrl &&
    rpcUrl.trim() !== '' &&
    contractAddress &&
    contractAddress.trim() !== ''
  );

  const canSubmitTransactions = Boolean(
    canVerifyReadOnly &&
    privateKey &&
    privateKey.trim() !== ''
  );

  return {
    isConfigured: canSubmitTransactions,
    canVerifyReadOnly,
    canSubmitTransactions,
    rpcUrl: rpcUrl?.trim(),
    contractAddress: contractAddress?.trim(),
    privateKey: privateKey?.trim(),
    chainId,
  };
}

/**
 * Executes a JSON-RPC query against the configured EVM node.
 */
export async function queryEvmRpc(method: string, params: any[]): Promise<any> {
  const { rpcUrl } = getEvmConfig();
  if (!rpcUrl) {
    throw new Error('EVM_RPC_URL is not configured');
  }

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`RPC node returned HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || 'EVM RPC error');
  }

  return json.result;
}

export function getBlockchainStatus(): BlockchainStatus {
  const config = getEvmConfig();

  let currentMode: BlockchainStatus['currentMode'] = 'simulated_testnet';
  if (config.canSubmitTransactions) {
    currentMode = 'configured_ready';
  } else if (config.canVerifyReadOnly) {
    currentMode = 'read_only_verification';
  }

  return {
    isRealConfigured: Boolean(config.canSubmitTransactions),
    networkName: `Polygon Amoy Testnet (Chain ID: ${config.chainId})`,
    chainId: config.chainId,
    rpcConfigured: Boolean(config.rpcUrl),
    signerConfigured: Boolean(config.privateKey),
    canVerifyReadOnly: config.canVerifyReadOnly,
    canSubmitTransactions: config.canSubmitTransactions,
    contractAddress: config.contractAddress || 'Pending Deployment',
    currentMode,
    smartContractSource: SOLIDITY_CONTRACT_SOURCE,
    setupInstructions: [
      '1. Acquire testnet POL from Polygon Amoy Faucet (https://faucet.polygon.technology/)',
      '2. Deploy ClimateEvidenceAnchor.sol (located in server/contracts/ClimateEvidenceAnchor.sol) to Polygon Amoy (Chain ID 80002)',
      '3. Set EVM_RPC_URL="https://rpc-amoy.polygon.technology" in your .env file',
      '4. Set EVM_CONTRACT_ADDRESS="<deployed_contract_address>" in .env',
      '5. (Optional for read-only verification) Set EVM_PRIVATE_KEY="<funded_signer_private_key>" in your secure server environment to broadcast transactions',
      '6. Set EVM_CHAIN_ID="80002" in .env',
      '7. Restart dev server; ClimateLens will automatically broadcast (if signer key provided) and independently re-verify transactions on-chain',
    ],
  };
}

export interface OnChainVerificationResult {
  isVerified: boolean;
  onChainStatus: 'unsubmitted_simulated' | 'on_chain_confirmed' | 'network_unreachable' | 'failed' | 'unverified_network_unavailable';
  blockNumber?: number;
  transactionHash?: string;
  statusNotice: string;
  contractVerified?: boolean;
}

/**
 * Independently re-verifies an on-chain transaction by re-querying:
 * 1. Transaction receipt from the configured EVM RPC node.
 * 2. Receipt status (must be 1).
 * 3. Event logs emitted strictly by the configured contract address (log.address check).
 * 4. The EvidenceAnchored event argument matching the exact evidence digest.
 * 5. The deployed contract's verifyEvidence view method.
 */
export async function verifyOnChainProof(
  snapshot: EvidenceSnapshot,
  proof: IntegrityProof,
  customConfig?: EvmConfig,
  customProvider?: ethers.Provider
): Promise<OnChainVerificationResult> {
  const config = customConfig || getEvmConfig();

  if (!proof.transactionHash) {
    return {
      isVerified: false,
      onChainStatus: 'unsubmitted_simulated',
      statusNotice: 'No transaction hash registered for this evidence record.',
    };
  }

  if (!config.canVerifyReadOnly && !customProvider) {
    return {
      isVerified: false,
      onChainStatus: 'unverified_network_unavailable',
      transactionHash: proof.transactionHash,
      blockNumber: proof.blockNumber,
      statusNotice:
        'EVM RPC or contract address unconfigured: Cannot independently re-verify live on-chain state without an active network connection and contract reference.',
    };
  }

  try {
    const provider = customProvider || new ethers.JsonRpcProvider(config.rpcUrl, undefined, { staticNetwork: false });

    // 1. Validate connected RPC network chain ID matches configured target chain
    const networkInfo = await provider.getNetwork();
    if (Number(networkInfo.chainId) !== config.chainId) {
      return {
        isVerified: false,
        onChainStatus: 'failed',
        transactionHash: proof.transactionHash,
        statusNotice: `Chain ID mismatch during re-verification: Connected RPC returned chainId ${networkInfo.chainId}, expected ${config.chainId}.`,
      };
    }

    // 2. Fetch transaction receipt from RPC
    const receipt = await provider.getTransactionReceipt(proof.transactionHash);
    if (!receipt) {
      return {
        isVerified: false,
        onChainStatus: 'unverified_network_unavailable',
        transactionHash: proof.transactionHash,
        statusNotice: `Transaction ${proof.transactionHash} receipt not found on network (may be pending in mempool or pruned).`,
      };
    }

    if (receipt.status !== 1) {
      return {
        isVerified: false,
        onChainStatus: 'failed',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        statusNotice: 'On-chain verification failed: Transaction was mined but execution reverted (status 0).',
      };
    }

    // 3. Validate event logs strictly from configured contract address
    const contract = new ethers.Contract(config.contractAddress || '', ANCHOR_CONTRACT_ABI, provider);
    const evidenceHashBytes32 = snapshot.contentHash.startsWith('0x')
      ? snapshot.contentHash
      : `0x${snapshot.contentHash}`;

    let eventFound = false;
    for (const log of receipt.logs) {
      // Reject logs from other contract addresses (case-insensitive check)
      if (!log.address || log.address.toLowerCase() !== (config.contractAddress || '').toLowerCase()) {
        continue;
      }
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'EvidenceAnchored') {
          const loggedHash = (parsed.args[0] || parsed.args.evidenceHash || '').toString().toLowerCase();
          if (loggedHash === evidenceHashBytes32.toLowerCase()) {
            eventFound = true;
            break;
          }
        }
      } catch {
        // ignore non-matching logs
      }
    }

    if (!eventFound) {
      return {
        isVerified: false,
        onChainStatus: 'failed',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        statusNotice:
          'On-chain verification failed: Transaction receipt found, but no EvidenceAnchored event emitted by configured contract address matched this evidence digest.',
      };
    }

    // 4. Query deployed contract's verifyEvidence view method (FAIL CLOSED)
    let isAnchored = false;
    try {
      const res = await contract.verifyEvidence(evidenceHashBytes32);
      isAnchored = Boolean(Array.isArray(res) ? res[0] : res?.isAnchored);
    } catch (contractErr: any) {
      // Fail closed: Never treat a failed, reverted, or uncallable view check as success!
      return {
        isVerified: false,
        onChainStatus: 'failed',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        statusNotice: `On-chain verification failed: Contract verifyEvidence() call failed or reverted: ${contractErr?.message || 'Call failed'}.`,
      };
    }

    if (!isAnchored) {
      return {
        isVerified: false,
        onChainStatus: 'failed',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        statusNotice: 'On-chain verification failed: Contract verifyEvidence() view returned false (record not anchored).',
      };
    }

    return {
      isVerified: true,
      onChainStatus: 'on_chain_confirmed',
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractVerified: true,
      statusNotice: `Independently confirmed on-chain in block ${receipt.blockNumber}. Receipt status 1, EvidenceAnchored event verified from configured contract ${config.contractAddress}, and contract state confirmed.`,
    };
  } catch (err: any) {
    return {
      isVerified: false,
      onChainStatus: 'unverified_network_unavailable',
      transactionHash: proof.transactionHash,
      statusNotice: `On-chain re-verification unavailable: ${err.message || 'EVM RPC network unreachable'}.`,
    };
  }
}

export function verifyEvidenceSnapshot(snapshotId: string, customPayload?: string): VerificationReport {
  const snapshot = db.getEvidenceSnapshotById(snapshotId);
  if (!snapshot) {
    return {
      evidenceId: snapshotId,
      originalRegisteredHash: 'UNKNOWN',
      recalculatedHash: 'UNKNOWN',
      isMatch: false,
      status: 'UNVERIFIABLE',
      proofType: 'local_cryptographic',
      verificationTimestamp: new Date().toISOString(),
      payloadLengthBytes: 0,
      explanation: `Snapshot record '${snapshotId}' was not found in the evidence store. Verification is unverifiable without a trusted reference digest.`,
    };
  }

  const payloadToVerify = customPayload !== undefined ? customPayload : snapshot.canonicalPayload;
  const recalculatedHash = crypto.createHash('sha256').update(payloadToVerify, 'utf8').digest('hex');
  const originalRegisteredHash = snapshot.contentHash;
  const isMatch = recalculatedHash.toLowerCase() === originalRegisteredHash.toLowerCase();

  const proof = db.getProofBySnapshotId(snapshotId);
  const now = new Date().toISOString();
  const config = getEvmConfig();

  let explanation = '';
  if (isMatch) {
    explanation =
      'Cryptographic Match Verified: The recalculated SHA-256 hash matches the original registered digest byte-for-byte. The evidence snapshot payload has remained unaltered since creation.';
  } else {
    explanation =
      'Cryptographic Mismatch Detected: The recalculated SHA-256 hash does NOT match the registered digest. The canonical payload content has been modified or tampered with.';
  }

  let blockchainProof = undefined;
  if (proof && proof.proofType === 'testnet_anchor') {
    if (proof.transactionHash) {
      // Synchronous verifier strictly validates local RFC 8785 SHA-256 integrity.
      // It never claims live on-chain confirmation merely because configuration variables exist.
      // Live blockchain verification is exclusively handled via verifyEvidenceSnapshotAsync() and verifyOnChainProof().
      blockchainProof = {
        network: proof.network || 'Polygon Amoy Testnet (Chain ID: 80002)',
        transactionHash: proof.transactionHash,
        isSimulated: false,
        isRealOnChain: false,
        blockNumber: proof.blockNumber,
        anchorTimestamp: proof.registeredAt,
        explorerUrl: proof.explorerUrl || `https://amoy.polygonscan.com/tx/${proof.transactionHash}`,
        onChainStatus: 'unverified_network_unavailable' as const,
        statusNotice:
          'Local RFC 8785 SHA-256 integrity verified. Live on-chain status requires asynchronous network validation via verifyEvidenceSnapshotAsync().',
      };
    } else if (proof.onChainStatus === 'failed' || proof.onChainStatus === 'network_unreachable') {
      blockchainProof = {
        network: proof.network || 'Polygon Amoy Testnet',
        transactionHash: proof.transactionHash,
        isSimulated: false,
        isRealOnChain: false,
        blockNumber: proof.blockNumber,
        anchorTimestamp: proof.registeredAt,
        explorerUrl: proof.explorerUrl,
        onChainStatus: proof.onChainStatus,
        statusNotice: proof.statusNotice || 'On-chain transaction failed or was not confirmed.',
      };
    } else {
      // Unconfigured or explicitly simulated mode: NEVER invent fake tx hashes or fake block numbers
      blockchainProof = {
        network: 'Polygon Amoy Testnet (Chain ID: 80002)',
        transactionHash: undefined,
        isSimulated: true,
        isRealOnChain: false,
        blockNumber: undefined,
        anchorTimestamp: proof.registeredAt,
        explorerUrl: undefined,
        onChainStatus: 'unsubmitted_simulated' as const,
        statusNotice:
          'SIMULATED DEMONSTRATION: EVM RPC is unconfigured. No on-chain transaction was submitted or mined. Proof is verified locally via deterministic RFC 8785 SHA-256 digest.',
      };
    }
  }

  return {
    evidenceId: snapshotId,
    originalRegisteredHash,
    recalculatedHash,
    isMatch,
    status: isMatch ? 'MATCH' : 'MISMATCH',
    proofType: proof?.proofType || 'local_cryptographic',
    verificationTimestamp: now,
    payloadLengthBytes: Buffer.byteLength(payloadToVerify, 'utf8'),
    explanation,
    blockchainProof,
  };
}

/**
 * Asynchronously verifies snapshot integrity, actively querying the EVM node
 * and contract state if a transaction hash is present.
 */
export async function verifyEvidenceSnapshotAsync(
  snapshotId: string,
  customPayload?: string,
  customProvider?: ethers.Provider,
  customConfig?: EvmConfig
): Promise<VerificationReport> {
  const report = verifyEvidenceSnapshot(snapshotId, customPayload);
  const snapshot = db.getEvidenceSnapshotById(snapshotId);
  const proof = db.getProofBySnapshotId(snapshotId);

  if (!snapshot || !proof || proof.proofType !== 'testnet_anchor') {
    return report;
  }

  if (proof.transactionHash) {
    const config = customConfig || getEvmConfig();
    const onChainResult = await verifyOnChainProof(snapshot, proof, config, customProvider);

    if (report.blockchainProof) {
      report.blockchainProof.isRealOnChain = onChainResult.isVerified;
      report.blockchainProof.onChainStatus = onChainResult.onChainStatus;
      report.blockchainProof.statusNotice = onChainResult.statusNotice;
      if (onChainResult.blockNumber) {
        report.blockchainProof.blockNumber = onChainResult.blockNumber;
      }
    }
  }

  return report;
}

export function verifyRawFilePayload(rawContent: string, claimedDigest?: string): {
  isMatch: boolean;
  status: 'MATCH' | 'MISMATCH' | 'UNVERIFIABLE';
  recalculatedHash: string;
  claimedDigest: string | null;
  explanation: string;
} {
  const recalculatedHash = crypto.createHash('sha256').update(rawContent, 'utf8').digest('hex');

  if (!claimedDigest || claimedDigest.trim() === '') {
    return {
      isMatch: false,
      status: 'UNVERIFIABLE',
      recalculatedHash,
      claimedDigest: null,
      explanation:
        'No reference hash was provided for comparison. The SHA-256 digest of the uploaded file was computed, but cannot be verified without a registered digest.',
    };
  }

  const cleanClaimed = claimedDigest.trim().toLowerCase();
  const cleanRecalc = recalculatedHash.toLowerCase();
  const isMatch = cleanClaimed === cleanRecalc;

  return {
    isMatch,
    status: isMatch ? 'MATCH' : 'MISMATCH',
    recalculatedHash,
    claimedDigest: claimedDigest.trim(),
    explanation: isMatch
      ? 'The calculated SHA-256 digest of the uploaded payload matches the claimed digest exactly. Document integrity verified.'
      : 'The calculated SHA-256 digest of the uploaded file DOES NOT match the claimed digest. The document has been modified.',
  };
}

/**
 * Validates and submits an on-chain anchor transaction via ethers.js.
 * Only returns on_chain_confirmed when:
 * 1. RPC node responds and chain ID matches.
 * 2. Contract address and signer are valid.
 * 3. anchorEvidence() transaction is mined with receipt.status === 1.
 * 4. The receipt emits the expected EvidenceAnchored event from the configured contract address.
 * 5. The event's evidenceHash matches the exact evidence digest.
 */
export async function executeOnChainAnchor(
  snapshot: EvidenceSnapshot,
  config: EvmConfig,
  network = 'Polygon Amoy Testnet',
  customSigner?: ethers.Signer
): Promise<IntegrityProof> {
  const now = new Date().toISOString();

  // Validate Contract Address Format
  if (!config.contractAddress || !ethers.isAddress(config.contractAddress)) {
    return {
      id: `prf-err-${Date.now()}`,
      evidenceSnapshotId: snapshot.id,
      hashAlgorithm: 'SHA-256',
      registeredHash: snapshot.contentHash,
      proofType: 'testnet_anchor',
      network: `${network} (Invalid Address)`,
      isSimulated: false,
      isRealOnChain: false,
      transactionHash: undefined,
      blockNumber: undefined,
      onChainStatus: 'failed',
      verificationStatus: 'failed',
      statusNotice: `Contract address '${config.contractAddress}' is not a valid EVM hex address.`,
      registeredAt: now,
    };
  }

  // Format 32-byte digest
  let cleanHash = snapshot.contentHash.trim();
  if (cleanHash.startsWith('0x')) {
    cleanHash = cleanHash.slice(2);
  }
  if (cleanHash.length !== 64) {
    return {
      id: `prf-err-${Date.now()}`,
      evidenceSnapshotId: snapshot.id,
      hashAlgorithm: 'SHA-256',
      registeredHash: snapshot.contentHash,
      proofType: 'testnet_anchor',
      network,
      isSimulated: false,
      isRealOnChain: false,
      transactionHash: undefined,
      blockNumber: undefined,
      onChainStatus: 'failed',
      verificationStatus: 'failed',
      statusNotice: `Invalid evidence digest length: expected 64 hex characters, received ${cleanHash.length}.`,
      registeredAt: now,
    };
  }
  const evidenceHashBytes32 = `0x${cleanHash}`;
  const locationLabel = snapshot.locationReference || 'Unspecified Location';

  try {
    let signer: ethers.Signer;
    let provider: ethers.Provider;

    if (customSigner) {
      signer = customSigner;
      provider = signer.provider || new ethers.JsonRpcProvider(config.rpcUrl);
    } else {
      if (!config.rpcUrl) {
        throw new Error('EVM_RPC_URL is missing: Network RPC URL is required to broadcast transaction');
      }
      if (!config.privateKey || config.privateKey.trim() === '') {
        throw new Error('EVM_PRIVATE_KEY is missing: Signer private key is required to broadcast transaction');
      }

      // Initialize provider with timeout
      provider = new ethers.JsonRpcProvider(config.rpcUrl, undefined, { staticNetwork: false });

      // Initialize Wallet Signer
      let rawKey = config.privateKey.trim();
      if (!rawKey.startsWith('0x')) {
        rawKey = `0x${rawKey}`;
      }
      signer = new ethers.Wallet(rawKey, provider);
    }

    // Verify Chain ID for all signers/providers
    const networkInfo = await provider.getNetwork();
    if (Number(networkInfo.chainId) !== config.chainId) {
      return {
        id: `prf-chain-${Date.now()}`,
        evidenceSnapshotId: snapshot.id,
        hashAlgorithm: 'SHA-256',
        registeredHash: snapshot.contentHash,
        proofType: 'testnet_anchor',
        network: `${network} (Chain Mismatch)`,
        isSimulated: false,
        isRealOnChain: false,
        transactionHash: undefined,
        blockNumber: undefined,
        onChainStatus: 'failed',
        verificationStatus: 'failed',
        statusNotice: `Chain ID mismatch: RPC returned chainId ${networkInfo.chainId}, expected ${config.chainId}.`,
        registeredAt: now,
      };
    }

    const contract = new ethers.Contract(config.contractAddress, ANCHOR_CONTRACT_ABI, signer);

    // Call smart contract transaction
    const tx = await contract.anchorEvidence(evidenceHashBytes32, locationLabel);
    const receipt = await tx.wait();

    // Check transaction execution status
    if (!receipt || receipt.status !== 1) {
      return {
        id: `prf-revert-${Date.now()}`,
        evidenceSnapshotId: snapshot.id,
        hashAlgorithm: 'SHA-256',
        registeredHash: snapshot.contentHash,
        proofType: 'testnet_anchor',
        network,
        isSimulated: false,
        isRealOnChain: false,
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        onChainStatus: 'failed',
        verificationStatus: 'failed',
        statusNotice: 'Transaction execution failed: transaction reverted on-chain (status 0).',
        registeredAt: now,
      };
    }

    // Verify EvidenceAnchored contract event in logs:
    // MUST match configured contract address AND exact evidence digest!
    let eventVerified = false;
    for (const log of receipt.logs) {
      // 1. Enforce that log.address matches configured contract address (case-insensitive)
      if (!log.address || log.address.toLowerCase() !== config.contractAddress.toLowerCase()) {
        continue; // Reject logs emitted by any other contract!
      }

      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'EvidenceAnchored') {
          const loggedHash = (parsed.args[0] || parsed.args.evidenceHash || '').toString().toLowerCase();
          if (loggedHash === evidenceHashBytes32.toLowerCase()) {
            eventVerified = true;
            break;
          }
        }
      } catch {
        // Log parse failure for non-matching events
      }
    }

    if (!eventVerified) {
      return {
        id: `prf-event-mismatch-${Date.now()}`,
        evidenceSnapshotId: snapshot.id,
        hashAlgorithm: 'SHA-256',
        registeredHash: snapshot.contentHash,
        proofType: 'testnet_anchor',
        network,
        isSimulated: false,
        isRealOnChain: false,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        onChainStatus: 'failed',
        verificationStatus: 'failed',
        statusNotice: `Transaction succeeded in block ${receipt.blockNumber}, but expected EvidenceAnchored event from ${config.contractAddress} with matching digest was not emitted.`,
        registeredAt: now,
      };
    }

    // Genuinely confirmed on-chain
    return {
      id: `prf-tx-${Date.now()}`,
      evidenceSnapshotId: snapshot.id,
      hashAlgorithm: 'SHA-256',
      registeredHash: snapshot.contentHash,
      proofType: 'testnet_anchor',
      network,
      isSimulated: false,
      isRealOnChain: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      verificationStatus: 'verified',
      onChainStatus: 'on_chain_confirmed',
      statusNotice: `Anchored on-chain in block ${receipt.blockNumber} with verified EvidenceAnchored event from contract ${config.contractAddress}.`,
      explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
      registeredAt: now,
    };
  } catch (err: any) {
    const isReverted = err?.receipt?.status === 0 || err?.message?.includes('reverted');
    const isNetworkError =
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'ENOTFOUND' ||
      err?.message?.includes('fetch') ||
      err?.message?.includes('connect') ||
      err?.message?.includes('network');

    return {
      id: `prf-fail-${Date.now()}`,
      evidenceSnapshotId: snapshot.id,
      hashAlgorithm: 'SHA-256',
      registeredHash: snapshot.contentHash,
      proofType: 'testnet_anchor',
      network,
      isSimulated: false,
      isRealOnChain: false,
      transactionHash: err?.receipt?.hash,
      blockNumber: err?.receipt?.blockNumber,
      onChainStatus: isReverted ? 'failed' : isNetworkError ? 'network_unreachable' : 'failed',
      verificationStatus: 'failed',
      statusNotice: isReverted
        ? 'Transaction execution failed: transaction reverted on-chain (status 0).'
        : `On-chain submission failed: ${err.message || 'EVM RPC connection failed'}`,
      registeredAt: now,
    };
  }
}

/**
 * Registers a testnet anchor.
 * If credentials are not configured, returns an explicit simulated proof without fake hashes.
 * If credentials are configured, broadcasts a real transaction and verifies the event before confirming.
 */
export async function registerTestnetAnchor(
  snapshotId: string,
  network = 'Polygon Amoy Testnet (Chain ID: 80002)'
): Promise<IntegrityProof> {
  const snapshot = db.getEvidenceSnapshotById(snapshotId);
  if (!snapshot) {
    throw new Error(`Cannot register testnet anchor: snapshot ${snapshotId} does not exist.`);
  }

  const config = getEvmConfig();
  const now = new Date().toISOString();

  if (!config.canSubmitTransactions) {
    // Honest unconfigured or read-only behavior:
    // DO NOT generate a synthetic 0x transaction hash or invent a block number!
    const notice = config.canVerifyReadOnly
      ? 'READ-ONLY VERIFICATION ACTIVE: EVM RPC and contract address are configured for verification, but no signer private key is configured to broadcast new transactions. No transaction was submitted. Content integrity is maintained via deterministic local SHA-256 ledger.'
      : 'SIMULATED DEMONSTRATION: EVM RPC and signer keys are unconfigured. No transaction was broadcast to the network. Content integrity is maintained via deterministic local SHA-256 ledger.';

    const proof: IntegrityProof = {
      id: `prf-sim-${Date.now()}`,
      evidenceSnapshotId: snapshotId,
      hashAlgorithm: 'SHA-256',
      registeredHash: snapshot.contentHash,
      proofType: 'testnet_anchor',
      network: config.canVerifyReadOnly ? `${network} (Read-Only Mode)` : `${network} (Simulated Demo)`,
      isSimulated: true,
      isRealOnChain: false,
      transactionHash: undefined,
      blockNumber: undefined,
      onChainStatus: 'unsubmitted_simulated',
      statusNotice: notice,
      verificationStatus: 'local_only',
      registeredAt: now,
      explorerUrl: undefined,
    };

    db.saveIntegrityProof(proof);
    return proof;
  }

  // When real configuration is present, broadcast the transaction and await confirmed receipt & event
  const proof = await executeOnChainAnchor(snapshot, config, network);
  db.saveIntegrityProof(proof);
  return proof;
}
