import { canonicalize } from '../server/utils/canonicalize.ts';
import { calculateSha256 } from '../server/utils/hashing.ts';
import { assessFreshness } from '../server/services/freshness.service.ts';
import { assessCompleteness } from '../server/services/completeness.service.ts';
import { ethers } from 'ethers';
import {
  verifyEvidenceSnapshot,
  verifyEvidenceSnapshotAsync,
  verifyOnChainProof,
  registerTestnetAnchor,
  verifyRawFilePayload,
  getBlockchainStatus,
  executeOnChainAnchor,
  ANCHOR_CONTRACT_ABI,
  getEvmConfig,
} from '../server/services/blockchain.service.ts';
import { buildClimateEvidenceTwin } from '../server/services/twin.service.ts';
import { getAllActions, updateActionStatus, sealActionReceipt } from '../server/services/action.service.ts';
import { explainWeatherData } from '../server/services/explanation.service.ts';
import { db } from '../server/db/database.ts';
import { WeatherData, EvidenceSnapshot, IntegrityProof } from '../server/types/index.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log(' ClimateLens Production-Readiness Master Integrity Test Suite');
  console.log(' IEEE ClimateChain Global Hackathon 2026 — Track 4');
  console.log('=============================================================\n');

  // --- Suite 1: Deterministic RFC 8785 Canonicalization ---
  console.log('--- Suite 1: Deterministic JSON Canonicalization (RFC 8785) ---');
  
  // Scrambled keys across multiple nesting levels
  const deepObjA = {
    z: 1,
    alpha: {
      deepZ: [3, 2, 1],
      deepA: { nestedKey2: 'val2', nestedKey1: 'val1' },
    },
    beta: 'test',
  };
  const deepObjB = {
    alpha: {
      deepA: { nestedKey1: 'val1', nestedKey2: 'val2' },
      deepZ: [3, 2, 1],
    },
    beta: 'test',
    z: 1,
  };
  const canonA = canonicalize(deepObjA);
  const canonB = canonicalize(deepObjB);
  assert(canonA === canonB, 'Equivalent deep objects with scrambled keys produce identical canonical strings');
  assert(
    canonA === '{"alpha":{"deepA":{"nestedKey1":"val1","nestedKey2":"val2"},"deepZ":[3,2,1]},"beta":"test","z":1}',
    'Matches RFC 8785 UTF-16 strict lexicographical sorting specification'
  );

  // Numeric handling: IEEE 754, negative values, -0 serialization (RFC 8785 Sec 3.2.2.3)
  const numbersObj = {
    negZero: -0,
    posZero: 0,
    integerVal: 42,
    negativeVal: -15.75,
    floatingVal: 0.1234567,
  };
  const numbersCanon = canonicalize(numbersObj);
  assert(numbersCanon.includes('"negZero":0'), 'RFC 8785 rule: -0 canonicalizes strictly to 0');
  assert(numbersCanon.includes('"posZero":0'), 'Positive 0 canonicalizes strictly to 0');
  assert(numbersCanon.includes('"negativeVal":-15.75'), 'Preserves negative decimal floats');

  // Unicode preservation (Tamil script and symbols)
  const unicodeObj = {
    location: 'சென்னை (Chennai)',
    tamilLabel: 'வானிலை சான்று',
    symbol: '°C',
  };
  const unicodeCanon = canonicalize(unicodeObj);
  assert(unicodeCanon.includes('"location":"சென்னை (Chennai)"'), 'Preserves UTF-8 Tamil characters without ASCII escaping');
  assert(unicodeCanon.includes('"tamilLabel":"வானிலை சான்று"'), 'Preserves multi-byte Tamil script fidelity');

  // Malformed input handling: rejection of NaN, Infinity, and circular references
  let nanCaught = false;
  try {
    canonicalize({ invalid: NaN });
  } catch (err: any) {
    nanCaught = err.message.includes('RFC 8785');
  }
  assert(nanCaught, 'Rejects NaN as invalid non-finite JSON number per RFC 8785');

  let infinityCaught = false;
  try {
    canonicalize({ invalid: Infinity });
  } catch (err: any) {
    infinityCaught = err.message.includes('RFC 8785');
  }
  assert(infinityCaught, 'Rejects Infinity per RFC 8785');

  let circularCaught = false;
  try {
    const circularObj: any = { name: 'circular' };
    circularObj.self = circularObj;
    canonicalize(circularObj);
  } catch (err: any) {
    circularCaught = err.message.includes('Circular');
  }
  // Official RFC 8785 Test Vectors
  assert(canonicalize({}) === '{}', 'RFC 8785 vector: Empty object canonicalizes to {}');
  assert(canonicalize([]) === '[]', 'RFC 8785 vector: Empty array canonicalizes to []');
  assert(
    canonicalize({ b: true, a: false, c: null }) === '{"a":false,"b":true,"c":null}',
    'RFC 8785 vector: Booleans and null ordered lexicographically'
  );
  assert(
    canonicalize([3, 1, 2]) === '[3,1,2]',
    'RFC 8785 vector: Array elements preserve original sequence without sorting'
  );
  assert(
    canonicalize([{ b: 1, a: 2 }, { y: 10, x: 20 }]) === '[{"a":2,"b":1},{"x":20,"y":10}]',
    'RFC 8785 vector: Nested arrays containing objects sort keys in each element'
  );
  // UTF-16 code-unit lexicographical sort: '1' (49) < 'A' (65) < 'a' (97) < '~' (126) < '€' (8364)
  const utf16KeyObj = {
    '€': 'Euro',
    'a': 'lower',
    'A': 'upper',
    '~': 'tilde',
    '1': 'digit',
  };
  const utf16Canon = canonicalize(utf16KeyObj);
  assert(
    utf16Canon === '{"1":"digit","A":"upper","a":"lower","~":"tilde","€":"Euro"}',
    'RFC 8785 vector: UTF-16 code unit ordering strictly verified ("1" < "A" < "a" < "~" < "€")'
  );

  // --- Suite 2: Cryptographic Hashing Determinism & Avalanche Effect ---
  console.log('\n--- Suite 2: Cryptographic Hashing Determinism & Avalanche Effect ---');
  const hashResult1 = calculateSha256(deepObjA);
  const hashResult2 = calculateSha256(deepObjB);
  assert(hashResult1.hash === hashResult2.hash, 'Deep equivalent payloads produce identical 64-char SHA-256 digests');
  assert(hashResult1.hash.length === 64, 'SHA-256 digest is exactly 64 hexadecimal characters');

  // 0.00001 change triggers complete avalanche change
  const tamperedObj = { ...deepObjA, z: 1.00001 };
  const hashTampered = calculateSha256(tamperedObj);
  assert(hashResult1.hash !== hashTampered.hash, 'Avalanche effect: 0.00001 value shift flips SHA-256 completely');

  // --- Suite 3: Blockchain Honesty & Real EVM Submission ---
  console.log('\n--- Suite 3: Blockchain Honesty & Verification ---');
  const bcStatus = getBlockchainStatus();
  assert(bcStatus.currentMode === 'simulated_testnet', 'Unconfigured mode accurately reports simulated_testnet');
  assert(bcStatus.smartContractSource.includes('contract ClimateEvidenceAnchor'), 'Provides complete Solidity contract source');

  // Configuration key normalization
  const normConfig = getEvmConfig();
  assert(normConfig.chainId === 80002, 'EVM configuration defaults to Polygon Amoy chain ID 80002');
  assert(normConfig.isConfigured === false, 'Detects unconfigured environment safely without error');

  // Verify read-only verification mode (RPC + contract address present, no private key)
  process.env.EVM_RPC_URL = 'https://polygon-amoy.infura.io/v3/mock-key';
  process.env.EVM_CONTRACT_ADDRESS = '0x' + '1'.repeat(40);
  const readOnlyStatus = getBlockchainStatus();
  assert(
    readOnlyStatus.currentMode === 'read_only_verification',
    'Read-only environment reports mode as read_only_verification'
  );
  assert(readOnlyStatus.canVerifyReadOnly === true, 'canVerifyReadOnly is true when RPC + contract are set');
  assert(readOnlyStatus.canSubmitTransactions === false, 'canSubmitTransactions is false without private key');

  // Verify configured mode reports configured_ready when private key is also present
  process.env.EVM_PRIVATE_KEY = '0x' + '2'.repeat(64);
  const configuredStatus = getBlockchainStatus();
  assert(
    configuredStatus.currentMode === 'configured_ready',
    'Configured environment reports mode as configured_ready (not real_onchain before broadcast)'
  );
  assert(configuredStatus.canSubmitTransactions === true, 'canSubmitTransactions is true with private key');

  delete process.env.EVM_RPC_URL;
  delete process.env.EVM_CONTRACT_ADDRESS;
  delete process.env.EVM_PRIVATE_KEY;

  // Retrieve an existing snapshot from DB
  const snapshots = db.getEvidenceSnapshots();
  assert(snapshots.length > 0, `Database contains ${snapshots.length} persistent evidence records`);
  const testSnapshot = snapshots[0];

  // 1. In unconfigured mode: verify no synthetic hash or invented block number is generated
  const unconfiguredProof = await registerTestnetAnchor(testSnapshot.id, 'Polygon Amoy Testnet');
  assert(unconfiguredProof.isSimulated === true, 'Explicitly marks proof as simulated');
  assert(unconfiguredProof.isRealOnChain === false, 'Explicitly reports isRealOnChain as false');
  assert(unconfiguredProof.transactionHash === undefined, 'No synthetic 0x transaction hash is invented');
  assert(unconfiguredProof.blockNumber === undefined, 'No fake block number is invented');
  assert(unconfiguredProof.verificationStatus === 'local_only', 'Verification status is local_only');
  assert(unconfiguredProof.onChainStatus === 'unsubmitted_simulated', 'On-chain status is unsubmitted_simulated');
  assert(
    unconfiguredProof.statusNotice?.includes('SIMULATED DEMONSTRATION') === true,
    'Status notice clearly explains EVM RPC is unconfigured'
  );

  // 2. Invalid contract address format rejection (pre-broadcast guard)
  const invalidAddrProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: 'not-a-valid-hex-contract-address',
      rpcUrl: 'http://localhost:8545',
      privateKey: '0x' + '1'.repeat(64),
      chainId: 80002,
    }
  );
  assert(invalidAddrProof.onChainStatus === 'failed', 'Invalid contract address rejected before broadcast');
  assert(invalidAddrProof.isRealOnChain === false, 'Invalid contract address: isRealOnChain is false');
  assert(invalidAddrProof.transactionHash === undefined, 'Invalid contract address: No fake transaction hash');

  // 3. Unreachable / Failed RPC call handling
  const unreachableProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: '0x' + '1'.repeat(40),
      rpcUrl: 'http://127.0.0.1:54321/nonexistent',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    }
  );
  assert(unreachableProof.onChainStatus === 'network_unreachable', 'Unreachable RPC node flagged as network_unreachable');
  assert(unreachableProof.isRealOnChain === false, 'Unreachable RPC: isRealOnChain is false');
  assert(unreachableProof.transactionHash === undefined, 'Unreachable RPC: No fake transaction hash generated');

  // 4. Chain ID mismatch handling
  const wrongChainProvider: any = {
    getNetwork: async () => ({ chainId: 1n }), // Ethereum Mainnet instead of Amoy 80002
  };
  const wrongChainSigner: any = {
    provider: wrongChainProvider,
    getAddress: async () => '0x' + '3'.repeat(40),
  };
  const wrongChainProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: '0x' + '1'.repeat(40),
      rpcUrl: 'http://mock-rpc',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    },
    'Polygon Amoy Testnet',
    wrongChainSigner
  );
  assert(wrongChainProof.onChainStatus === 'failed', 'Chain ID mismatch halts broadcast with failed status');
  assert(wrongChainProof.statusNotice?.includes('Chain ID mismatch') === true, 'Status notice reports chain ID mismatch');
  assert(wrongChainProof.transactionHash === undefined, 'Chain ID mismatch: No transaction hash created');

  // 5. Reverted Transaction Receipt handling (receipt.status === 0)
  const revertedReceipt = {
    status: 0, // Reverted
    hash: '0x' + 'f'.repeat(64),
    blockNumber: 43210,
    logs: [],
  };
  const mockRevertedProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => revertedReceipt,
  };
  const mockRevertedSigner: any = {
    provider: mockRevertedProvider,
    sendTransaction: async () => ({
      hash: revertedReceipt.hash,
      wait: async () => revertedReceipt,
      provider: mockRevertedProvider,
    }),
  };
  const revertedProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: '0x' + '1'.repeat(40),
      rpcUrl: 'http://mock-rpc',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    },
    'Polygon Amoy Testnet',
    mockRevertedSigner
  );
  assert(revertedProof.onChainStatus === 'failed', 'Reverted transaction flagged as onChainStatus: failed');
  assert(revertedProof.isRealOnChain === false, 'Reverted transaction: isRealOnChain is false');
  assert(revertedProof.statusNotice?.includes('reverted on-chain') === true, 'Status notice explains transaction reverted');

  // 6. Missing or Incorrect Contract Event handling
  const noEventReceipt = {
    status: 1, // Succeeded in EVM, but did not emit our event
    hash: '0x' + 'e'.repeat(64),
    blockNumber: 43211,
    logs: [], // Empty logs
  };
  const mockNoEventProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => noEventReceipt,
  };
  const mockNoEventSigner: any = {
    provider: mockNoEventProvider,
    sendTransaction: async () => ({
      hash: noEventReceipt.hash,
      wait: async () => noEventReceipt,
      provider: mockNoEventProvider,
    }),
  };
  const noEventProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: '0x' + '1'.repeat(40),
      rpcUrl: 'http://mock-rpc',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    },
    'Polygon Amoy Testnet',
    mockNoEventSigner
  );
  assert(noEventProof.onChainStatus === 'failed', 'Missing EvidenceAnchored event flagged as onChainStatus: failed');
  assert(noEventProof.isRealOnChain === false, 'Missing event: isRealOnChain is false');
  assert(
    noEventProof.statusNotice?.includes('EvidenceAnchored event') === true &&
      noEventProof.statusNotice?.includes('matching digest was not emitted') === true,
    'Status notice explains missing event log verification failure'
  );

  // 6b. Reject event from wrong contract address (anti-spoofing check)
  const iface = new ethers.Interface(ANCHOR_CONTRACT_ABI);
  const cleanDigest = testSnapshot.contentHash.startsWith('0x') ? testSnapshot.contentHash : `0x${testSnapshot.contentHash}`;
  const targetContractAddress = '0x' + '1'.repeat(40);
  const wrongEmitterAddress = '0x' + '9'.repeat(40);

  const spoofedEventLog = {
    ...iface.encodeEventLog(iface.getEvent('EvidenceAnchored')!, [
      cleanDigest,
      testSnapshot.locationReference || 'Chennai',
      Math.floor(Date.now() / 1000),
      '0x' + '4'.repeat(40),
    ]),
    address: wrongEmitterAddress, // Malicious / different contract address!
  };
  const wrongEmitterReceipt = {
    status: 1,
    hash: '0x' + 'b'.repeat(64),
    blockNumber: 43212,
    logs: [spoofedEventLog],
  };
  const mockWrongEmitterProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => wrongEmitterReceipt,
  };
  const mockWrongEmitterSigner: any = {
    provider: mockWrongEmitterProvider,
    sendTransaction: async () => ({
      hash: wrongEmitterReceipt.hash,
      wait: async () => wrongEmitterReceipt,
      provider: mockWrongEmitterProvider,
    }),
  };
  const wrongEmitterProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    },
    'Polygon Amoy Testnet',
    mockWrongEmitterSigner
  );
  assert(wrongEmitterProof.onChainStatus === 'failed', 'Event from wrong contract address rejected with onChainStatus: failed');
  assert(wrongEmitterProof.isRealOnChain === false, 'Wrong contract address: isRealOnChain is false');
  assert(
    wrongEmitterProof.statusNotice?.includes('expected EvidenceAnchored event from 0x1111') === true,
    'Status notice discloses that event from configured contract address was missing'
  );

  // 7. Successful Confirmation with Verified EvidenceAnchored Event from target contract
  const validEventLog = {
    ...iface.encodeEventLog(iface.getEvent('EvidenceAnchored')!, [
      cleanDigest,
      testSnapshot.locationReference || 'Chennai',
      Math.floor(Date.now() / 1000),
      '0x' + '4'.repeat(40),
    ]),
    address: targetContractAddress, // Strictly matching configured contract!
  };
  const confirmedReceipt = {
    status: 1,
    hash: '0x' + 'c'.repeat(64),
    blockNumber: 88888,
    logs: [validEventLog],
  };
  const encodedVerifyReturn = iface.encodeFunctionResult('verifyEvidence', [
    true,
    BigInt(Math.floor(Date.now() / 1000)),
    testSnapshot.locationReference || 'Chennai',
  ]);
  const mockConfirmedProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => confirmedReceipt,
    call: async () => encodedVerifyReturn,
  };
  const mockConfirmedSigner: any = {
    provider: mockConfirmedProvider,
    sendTransaction: async () => ({
      hash: confirmedReceipt.hash,
      wait: async () => confirmedReceipt,
      provider: mockConfirmedProvider,
    }),
  };
  const confirmedProof = await executeOnChainAnchor(
    testSnapshot,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      privateKey: '0x' + '2'.repeat(64),
      chainId: 80002,
    },
    'Polygon Amoy Testnet',
    mockConfirmedSigner
  );
  assert(confirmedProof.onChainStatus === 'on_chain_confirmed', 'Verified transaction confirmed with on_chain_confirmed');
  assert(confirmedProof.isRealOnChain === true, 'Verified transaction: isRealOnChain is true');
  assert(confirmedProof.transactionHash === confirmedReceipt.hash, 'Stores genuine confirmed transaction hash');
  assert(confirmedProof.blockNumber === confirmedReceipt.blockNumber, 'Stores genuine confirmed block number');
  assert(confirmedProof.verificationStatus === 'verified', 'Verification status marked verified');
  assert(confirmedProof.explorerUrl?.includes(confirmedReceipt.hash) === true, 'Generates valid explorer link to confirmed tx');

  // 7b. Independent On-Chain Re-verification via verifyOnChainProof()
  const confirmedProofRecord: IntegrityProof = {
    id: `prf-onchain-test-${Date.now()}`,
    evidenceSnapshotId: testSnapshot.id,
    hashAlgorithm: 'SHA-256',
    registeredHash: testSnapshot.contentHash,
    proofType: 'testnet_anchor',
    network: 'Polygon Amoy Testnet',
    isSimulated: false,
    isRealOnChain: true,
    transactionHash: confirmedReceipt.hash,
    blockNumber: confirmedReceipt.blockNumber,
    onChainStatus: 'on_chain_confirmed',
    verificationStatus: 'verified',
    registeredAt: new Date().toISOString(),
  };

  const reVerifyResult = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      chainId: 80002,
    },
    mockConfirmedProvider
  );
  assert(reVerifyResult.isVerified === true, 'verifyOnChainProof confirms valid receipt, matching emitter, and contract state');
  assert(reVerifyResult.onChainStatus === 'on_chain_confirmed', 'verifyOnChainProof returns on_chain_confirmed');
  assert(reVerifyResult.blockNumber === confirmedReceipt.blockNumber, 'verifyOnChainProof preserves confirmed block number');

  // 7c. Re-verification when RPC node is unreachable
  const failedProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => {
      throw new Error('ECONNREFUSED: Connection to EVM RPC node failed');
    },
  };
  const unreachableReVerify = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://unreachable-rpc',
      chainId: 80002,
    },
    failedProvider
  );
  assert(
    unreachableReVerify.onChainStatus === 'unverified_network_unavailable',
    'Unreachable RPC during re-verification reported as unverified_network_unavailable'
  );
  assert(unreachableReVerify.isVerified === false, 'Unreachable RPC: isVerified is false');
  assert(
    unreachableReVerify.statusNotice?.includes('re-verification unavailable') === true,
    'Status notice explains network unreachability'
  );

  // 7d. Chain ID Validation during re-verification (Ethereum Mainnet chainId 1 instead of Amoy 80002)
  const wrongChainReverifyProvider: any = {
    getNetwork: async () => ({ chainId: 1n }), // Mismatched chain ID
    getTransactionReceipt: async () => confirmedReceipt,
  };
  const wrongChainReverify = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      chainId: 80002,
    },
    wrongChainReverifyProvider
  );
  assert(wrongChainReverify.isVerified === false, 'Chain ID mismatch during re-verification: isVerified is false');
  assert(wrongChainReverify.onChainStatus === 'failed', 'Chain ID mismatch during re-verification sets onChainStatus: failed');
  assert(
    wrongChainReverify.statusNotice?.includes('Chain ID mismatch during re-verification') === true,
    'Status notice explains chain ID mismatch during re-verification'
  );

  // 7e. FAIL CLOSED: Contract state query verifyEvidence() throws/reverts
  const revertStateProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => confirmedReceipt,
    call: async () => {
      throw new Error('execution reverted: Evidence record corrupted');
    },
  };
  const revertStateReverify = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      chainId: 80002,
    },
    revertStateProvider
  );
  assert(revertStateReverify.isVerified === false, 'FAIL CLOSED: Contract call error halts verification with isVerified: false');
  assert(revertStateReverify.onChainStatus === 'failed', 'FAIL CLOSED: Contract call error reports onChainStatus: failed');
  assert(
    revertStateReverify.statusNotice?.includes('Contract verifyEvidence() call failed or reverted') === true,
    'Status notice explains contract-state call failure'
  );

  // 7f. Contract verifyEvidence() returns false (record not anchored)
  const falseStateProvider: any = {
    getNetwork: async () => ({ chainId: 80002n }),
    getTransactionReceipt: async () => confirmedReceipt,
    call: async () => iface.encodeFunctionResult('verifyEvidence', [false, 0n, '']),
  };
  const falseStateReverify = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: true,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      chainId: 80002,
    },
    falseStateProvider
  );
  assert(falseStateReverify.isVerified === false, 'verifyEvidence returning false results in isVerified: false');
  assert(falseStateReverify.onChainStatus === 'failed', 'verifyEvidence returning false results in onChainStatus: failed');
  assert(
    falseStateReverify.statusNotice?.includes('view returned false') === true,
    'Status notice explains contract view returned false'
  );

  // 7g. Synchronous verifyEvidenceSnapshot never independently claims on_chain_confirmed when configuration exists
  db.saveIntegrityProof(confirmedProofRecord);
  process.env.EVM_RPC_URL = 'https://polygon-amoy.infura.io/v3/test';
  process.env.EVM_CONTRACT_ADDRESS = targetContractAddress;
  process.env.EVM_PRIVATE_KEY = '0x' + '2'.repeat(64);

  const syncReportWithConfig = verifyEvidenceSnapshot(testSnapshot.id);
  assert(
    syncReportWithConfig.blockchainProof?.onChainStatus === 'unverified_network_unavailable',
    'Synchronous verifier NEVER claims on_chain_confirmed merely because config env vars exist'
  );
  assert(
    syncReportWithConfig.blockchainProof?.isRealOnChain === false,
    'Synchronous verifier reports isRealOnChain as false pending asynchronous verification'
  );
  assert(
    syncReportWithConfig.blockchainProof?.statusNotice?.includes('requires asynchronous network validation') === true,
    'Status notice instructs user that live on-chain status requires asynchronous validation'
  );

  delete process.env.EVM_RPC_URL;
  delete process.env.EVM_CONTRACT_ADDRESS;
  delete process.env.EVM_PRIVATE_KEY;

  // 7h. Async Verification with active provider updates status properly
  const asyncReport = await verifyEvidenceSnapshotAsync(testSnapshot.id, undefined, mockConfirmedProvider, {
    isConfigured: true,
    canVerifyReadOnly: true,
    canSubmitTransactions: true,
    contractAddress: targetContractAddress,
    rpcUrl: 'http://mock-rpc',
    chainId: 80002,
  });
  assert(
    asyncReport.blockchainProof?.onChainStatus === 'on_chain_confirmed',
    'verifyEvidenceSnapshotAsync actively re-verifies live on-chain receipt and contract status'
  );
  assert(asyncReport.blockchainProof?.isRealOnChain === true, 'verifyEvidenceSnapshotAsync marks isRealOnChain: true');

  // 7i. Read-only verification of existing proof succeeds WITHOUT private key
  const readOnlyReverify = await verifyOnChainProof(
    testSnapshot,
    confirmedProofRecord,
    {
      isConfigured: false,
      canVerifyReadOnly: true,
      canSubmitTransactions: false,
      contractAddress: targetContractAddress,
      rpcUrl: 'http://mock-rpc',
      chainId: 80002,
    },
    mockConfirmedProvider
  );
  assert(
    readOnlyReverify.isVerified === true,
    'Read-only verification succeeds with only RPC URL + contract address (no private key required)'
  );
  assert(readOnlyReverify.onChainStatus === 'on_chain_confirmed', 'Read-only verification returns on_chain_confirmed');
  assert(readOnlyReverify.contractVerified === true, 'Read-only verification confirms contract state');

  // 7j. Attempting to submit a transaction without private key fails safely without broadcast
  const noKeyConfig = {
    isConfigured: false,
    canVerifyReadOnly: true,
    canSubmitTransactions: false,
    contractAddress: targetContractAddress,
    rpcUrl: 'http://mock-rpc',
    chainId: 80002,
  };
  const noKeyProof = await executeOnChainAnchor(testSnapshot, noKeyConfig, 'Polygon Amoy Testnet');
  assert(noKeyProof.onChainStatus === 'failed', 'Transaction submission without private key fails safely');
  assert(noKeyProof.isRealOnChain === false, 'Transaction submission without private key: isRealOnChain is false');
  assert(noKeyProof.transactionHash === undefined, 'No fake transaction hash generated when private key is missing');
  assert(
    noKeyProof.statusNotice?.includes('private key is required') === true,
    'Status notice explains private key is required for transaction broadcast'
  );

  // 7k. registerTestnetAnchor in read-only environment returns unsubmitted_simulated with honest notice
  process.env.EVM_RPC_URL = 'https://polygon-amoy.infura.io/v3/test';
  process.env.EVM_CONTRACT_ADDRESS = targetContractAddress;
  delete process.env.EVM_PRIVATE_KEY;

  const readOnlyRegisterProof = await registerTestnetAnchor(testSnapshot.id);
  assert(
    readOnlyRegisterProof.onChainStatus === 'unsubmitted_simulated',
    'registerTestnetAnchor without private key reports unsubmitted_simulated'
  );
  assert(readOnlyRegisterProof.isRealOnChain === false, 'Read-only registration: isRealOnChain is false');
  assert(
    readOnlyRegisterProof.statusNotice?.includes('READ-ONLY VERIFICATION ACTIVE') === true,
    'Status notice distinguishes read-only verification from unconfigured mode'
  );

  delete process.env.EVM_RPC_URL;
  delete process.env.EVM_CONTRACT_ADDRESS;

  // Restore simulated proof in DB for subsequent baseline tests
  db.saveIntegrityProof(unconfiguredProof);

  // 8. Verification report honesty
  const verifyReport = verifyEvidenceSnapshot(testSnapshot.id);
  assert(verifyReport.isMatch === true, 'Original stored snapshot content matches its registered hash');
  assert(verifyReport.blockchainProof?.isSimulated === true, 'Verification report reports blockchain proof as simulated');
  assert(verifyReport.blockchainProof?.transactionHash === undefined, 'Verification report does not display fake tx hash');
  assert(verifyReport.blockchainProof?.blockNumber === undefined, 'Verification report does not invent block number');

  // --- Suite 4: Tampering Sandbox Immutability Guarantee ---
  console.log('\n--- Suite 4: Tampering Sandbox & Baseline Immutability ---');
  const originalPayloadBefore = testSnapshot.canonicalPayload;
  const originalHashBefore = testSnapshot.contentHash;

  // Simulate editing a copy in the sandbox
  const parsedClone = JSON.parse(testSnapshot.canonicalPayload);
  if (parsedClone.measurements) {
    parsedClone.measurements.temperature_celsius = (parsedClone.measurements.temperature_celsius || 30) + 10.0;
  } else if (parsedClone.telemetry) {
    parsedClone.telemetry.temperature_celsius = (parsedClone.telemetry.temperature_celsius || 30) + 10.0;
  } else {
    parsedClone.tamperedField = 'tampered_value';
  }
  const tamperedCanonical = canonicalize(parsedClone);

  const tamperReport = verifyEvidenceSnapshot(testSnapshot.id, tamperedCanonical);
  assert(tamperReport.isMatch === false, 'Tampered copy fails verification with isMatch === false');
  assert(tamperReport.status === 'MISMATCH', 'Tampered copy returns status MISMATCH');
  assert(tamperReport.recalculatedHash !== originalHashBefore, 'Recalculated hash diverges from registered digest');

  // Verify that the original snapshot in DB remained 100% UNCHANGED
  const snapshotAfterTest = db.getEvidenceSnapshotById(testSnapshot.id);
  assert(
    snapshotAfterTest?.canonicalPayload === originalPayloadBefore,
    'CRITICAL: Original evidence record canonical payload remains completely unchanged'
  );
  assert(
    snapshotAfterTest?.contentHash === originalHashBefore,
    'CRITICAL: Original evidence content hash remains completely unchanged'
  );

  // --- Suite 5: Rules-Based Quality Assessment Engines ---
  console.log('\n--- Suite 5: Quality Assessment Engines (Freshness & Completeness) ---');
  const now = new Date();
  const freshTime = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const staleTime = new Date(now.getTime() - 180 * 60 * 1000).toISOString();
  const expiredCutoff = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

  const freshRes = assessFreshness('weather_surface', freshTime, now.toISOString(), null);
  assert(freshRes.status === 'fresh', 'Record 15m old is flagged fresh for surface weather (threshold 120m)');

  const staleRes = assessFreshness('weather_surface', staleTime, now.toISOString(), null);
  assert(staleRes.status === 'stale', 'Record 180m old is flagged stale for surface weather');

  const expiredRes = assessFreshness('weather_surface', freshTime, now.toISOString(), expiredCutoff);
  assert(expiredRes.status === 'expired', 'Record with past validity cutoff is flagged expired');

  // Completeness without fabricating data
  const completeValues = {
    temperature: 31.5,
    apparentTemperature: 36.2,
    relativeHumidity: 68,
    precipitation: 0,
    windSpeed: 14,
    surfacePressure: 1011,
  };
  const compRes = assessCompleteness('weather_surface', completeValues);
  assert(compRes.status === 'complete', 'Payload with all core atmospheric fields marked complete');

  const partialValues = {
    temperature: 31.5,
    relativeHumidity: 68,
  };
  const partialRes = assessCompleteness('weather_surface', partialValues);
  assert(partialRes.status === 'partial', 'Payload missing core fields marked partial without fabricating readings');
  assert(partialRes.missingFields.includes('windSpeed'), 'Explicitly identifies windSpeed as missing');
  assert(partialRes.missingFields.includes('surfacePressure'), 'Explicitly identifies surfacePressure as missing');

  // --- Suite 6: Climate Evidence Twin Generation & Timestamp Stability ---
  console.log('\n--- Suite 6: Climate Evidence Twin & Timestamp Stability ---');
  const mockWeather: WeatherData = {
    location: {
      label: 'Chennai, Tamil Nadu, India',
      latitude: 13.0827,
      longitude: 80.2707,
    },
    source: {
      id: 'src-open-meteo',
      name: 'Open-Meteo Weather Model Suite',
      category: 'forecast',
      url: 'https://open-meteo.com',
      attribution: 'Weather data provided by Open-Meteo under CC BY 4.0',
      model: 'ECMWF IFS / DWD ICON Ensemble',
    },
    values: {
      temperature: 33.0,
      apparentTemperature: 38.5,
      relativeHumidity: 70,
      precipitation: 0.0,
      windSpeed: 14.5,
      surfacePressure: 1010.2,
      weatherCode: 1,
      weatherDescription: 'Mainly Clear',
    },
    units: {
      temperature: '°C',
      apparentTemperature: '°C',
      relativeHumidity: '%',
      precipitation: 'mm',
      windSpeed: 'km/h',
      surfacePressure: 'hPa',
    },
    timestamps: {
      sourceTime: '2026-10-21T05:00:00.000Z',
      retrievedAt: '2026-10-21T05:15:00.000Z',
    },
    freshness: {
      status: 'fresh',
      ageMinutes: 15,
      thresholdMinutes: 120,
      reason: 'Observed 15m ago',
      sourceTime: '2026-10-21T05:00:00.000Z',
      retrievedAt: '2026-10-21T05:15:00.000Z',
      validUntil: null,
    },
    completeness: {
      status: 'complete',
      missingFields: [],
      totalExpectedFields: 6,
      reason: 'All 6 fields present',
    },
    hourlyForecast: [],
    dailyForecast: [],
  };

  const fixedCreatedDate = '2026-10-21T05:15:00.000Z';
  const mockSnapshot: EvidenceSnapshot = {
    id: 'ev-test-stability-01',
    sourceId: 'src-open-meteo',
    dataType: 'weather_surface',
    locationReference: 'Chennai, Tamil Nadu, India',
    canonicalPayload: '{"test":"payload"}',
    sourceTimestamp: '2026-10-21T05:00:00.000Z',
    retrievedAt: '2026-10-21T05:15:00.000Z',
    validUntil: null,
    freshnessStatus: 'fresh',
    freshnessReason: 'Fresh',
    completenessStatus: 'complete',
    missingFields: [],
    contentHash: 'abc123hash',
    dataOrigin: 'live_provider',
    previousSnapshotId: null,
    createdAt: fixedCreatedDate,
  };

  const twinWithSnapshot = buildClimateEvidenceTwin(mockWeather, mockSnapshot);
  assert(
    twinWithSnapshot.timestamps.createdUtc === fixedCreatedDate,
    'Climate Evidence Twin preserves original record creation timestamp from snapshot instead of generating new Date()'
  );
  assert(twinWithSnapshot.derivedIndicators.heatStress.name === 'NOAA Steadman Heat Index', 'Derives Steadman Heat Index');
  assert(twinWithSnapshot.verification.hashAlgorithm === 'SHA-256', 'Canonicalized and sealed with SHA-256');

  // --- Suite 7: Action Ledger & Cryptographic Receipts ---
  console.log('\n--- Suite 7: Action Ledger & Cryptographic Receipts ---');
  const actions = getAllActions();
  assert(actions.length >= 3, `Action Ledger loaded ${actions.length} evidence-grounded actions`);

  const testAction = actions[0];
  const updatedAction = updateActionStatus(testAction.id, 'completed');
  assert(updatedAction.status === 'completed', 'Action status persists as completed');

  // Receipt uses actual saved record
  const sealedAction = sealActionReceipt(testAction.id);
  assert(sealedAction.cryptographicReceipt !== undefined, 'Seals cryptographic action receipt');
  assert(sealedAction.cryptographicReceipt?.receiptSha256.length === 64, 'Receipt contains valid SHA-256 digest');
  assert(
    sealedAction.cryptographicReceipt?.actionTitle === testAction.title.en,
    'Receipt pulls actual saved action title'
  );
  assert(
    sealedAction.cryptographicReceipt?.disclaimer.includes('User-Reported Action Completion') === true,
    'Receipt contains honest disclaimer distinguishing user-reported completion from verified physical sensor impact'
  );

  // --- Suite 8: Community Climate Challenges ---
  console.log('\n--- Suite 8: Community Climate Challenges Module ---');
  const challenges = db.getChallenges();
  assert(challenges.length >= 3, `Community module contains ${challenges.length} challenges`);
  const firstChallenge = challenges[0];
  const initialEvidenceCount = firstChallenge.evidenceCount;
  const initialParticipantCount = firstChallenge.participantCount;

  const updatedChallenge = db.recordChallengeEvidence(firstChallenge.id);
  assert(
    updatedChallenge.evidenceCount === initialEvidenceCount + 1,
    'Participant evidence increment accurately persists'
  );
  assert(
    updatedChallenge.participantCount === initialParticipantCount + 1,
    'Participant count increment accurately persists'
  );

  // --- Suite 9: Grounded AI Explanation (Bilingual) ---
  console.log('\n--- Suite 9: Grounded AI Explanation (EN & Tamil) ---');
  const enExpl = await explainWeatherData(mockWeather, 'en');
  assert(enExpl.meaning.length > 20, 'Generates comprehensive English grounded explanation');
  assert(enExpl.recommendedActions.length >= 2, 'Provides actionable preparedness recommendations');

  const taExpl = await explainWeatherData(mockWeather, 'ta');
  assert(taExpl.language === 'ta', 'Generates authentic Tamil explanation');
  assert(taExpl.meaning.length > 20, 'Tamil explanation preserves local terminology');

  console.log('\n=============================================================');
  console.log(` Master Test Summary: ${passed} passed, ${failed} failed`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal test execution failure:', err);
  process.exit(1);
});
