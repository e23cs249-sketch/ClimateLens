import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ExternalLink,
  Code2,
  Lock,
  HelpCircle,
} from 'lucide-react';
import {
  EvidenceSnapshot,
  VerificationResult,
  verifySnapshotApi,
  verifyCustomPayloadApi,
  registerTestnetProofApi,
} from '../services/api.ts';

interface VerificationPanelProps {
  snapshots: EvidenceSnapshot[];
  selectedSnapshotId?: string;
  onSelectSnapshot: (id: string) => void;
  language: 'en' | 'ta';
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  snapshots,
  selectedSnapshotId,
  onSelectSnapshot,
  language,
}) => {
  const currentSnapshot =
    snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[0] || null;

  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperedPayload, setTamperedPayload] = useState('');
  const [isRegisteringTestnet, setIsRegisteringTestnet] = useState(false);
  const [testnetTxResult, setTestnetTxResult] = useState<any | null>(null);

  // Initialize payload for current snapshot
  useEffect(() => {
    if (currentSnapshot) {
      setTamperedPayload(currentSnapshot.canonicalPayload);
      setTestnetTxResult(null);
      handleVerify(currentSnapshot.id);
    }
  }, [currentSnapshot?.id]);

  const handleVerify = async (snapshotId: string) => {
    setIsVerifying(true);
    try {
      const res = await verifySnapshotApi(snapshotId);
      setVerification(res);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestTamper = async () => {
    if (!currentSnapshot) return;
    setIsVerifying(true);
    try {
      const res = await verifyCustomPayloadApi(currentSnapshot.id, tamperedPayload);
      setVerification(res);
    } catch (err) {
      console.error('Tamper verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPayload = () => {
    if (!currentSnapshot) return;
    setTamperedPayload(currentSnapshot.canonicalPayload);
    handleVerify(currentSnapshot.id);
  };

  const handleRegisterOnChain = async () => {
    if (!currentSnapshot) return;
    setIsRegisteringTestnet(true);
    try {
      const res = await registerTestnetProofApi(currentSnapshot.id);
      setTestnetTxResult(res);
      handleVerify(currentSnapshot.id);
    } catch (err) {
      console.error('Testnet registration error:', err);
    } finally {
      setIsRegisteringTestnet(false);
    }
  };

  if (!currentSnapshot) {
    return (
      <div className="liquid-glass rounded-2xl p-8 text-center text-xs text-[#A7BAC4]">
        No evidence records available yet. Please select a city on My Area and click &ldquo;Seal Snapshot&rdquo;.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evidence Snapshot Selector */}
      <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-mono font-bold text-[#A7BAC4] uppercase tracking-wider mb-1">
            {language === 'ta' ? 'சரிபார்க்க வேண்டிய ஆதார பதிவை தேர்வு செய்க' : 'Select Evidence Snapshot to Audit'}
          </label>
          <select
            value={currentSnapshot.id}
            onChange={(e) => onSelectSnapshot(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs font-mono bg-black/40 text-[#F3F8FA] border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#19B8A5]"
          >
            {snapshots.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0B2633] text-white">
                {s.locationReference.split(',')[0]} · {new Date(s.createdAt).toLocaleTimeString()} ({s.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerify(currentSnapshot.id)}
            disabled={isVerifying}
            className="px-4 py-2 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying...' : 'Recalculate SHA-256'}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          className={`p-6 rounded-2xl border ${
            verification.isMatch
              ? 'bg-[#19B8A5]/10 border-[#19B8A5]/40 text-[#F3F8FA] glow-teal'
              : 'bg-[#FF6268]/15 border-[#FF6268]/50 text-[#F3F8FA]'
          } space-y-4 shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {verification.isMatch ? (
                <CheckCircle2 className="w-6 h-6 text-[#19B8A5]" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-[#FF6268]" />
              )}
              <div>
                <h3 className="text-base font-bold">
                  {verification.isMatch ? 'Cryptographic Integrity Match (VERIFIED)' : 'Integrity Mismatch Detected (TAMPERED)'}
                </h3>
                <span className="text-[11px] font-mono text-[#A7BAC4]">
                  Algorithm: SHA-256 · RFC 8785 Canonical JSON
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${
                verification.isMatch ? 'bg-[#19B8A5] text-[#071722]' : 'bg-[#FF6268] text-white'
              }`}
            >
              {verification.status}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-[#A7BAC4]">{verification.explanation}</p>

          {/* Hash Comparison Table */}
          <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#A7BAC4] uppercase block">
                Original Registered Hash (Immutable Ledger Record)
              </span>
              <div className="font-mono text-xs text-[#8CE6E0] break-all bg-black/40 p-2.5 rounded-xl border border-white/10 select-all">
                {verification.originalRegisteredHash}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-[#A7BAC4] uppercase block">
                Recalculated SHA-256 Digest (Current Verified Payload)
              </span>
              <div
                className={`font-mono text-xs break-all p-2.5 rounded-xl border select-all ${
                  verification.isMatch
                    ? 'bg-black/40 text-[#8CE6E0] border-white/10'
                    : 'bg-black/60 text-[#FF6268] border-[#FF6268] font-bold'
                }`}
              >
                {verification.recalculatedHash}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Tampering Simulator Sandbox */}
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FFBF69]" />
              <h3 className="text-sm font-bold text-[#F3F8FA]">
                {language === 'ta' ? 'பாதுகாப்பான சிதைவு சோதனை (Tampering Simulation Sandbox)' : 'Safe Tampering Demonstration Sandbox'}
              </h3>
            </div>
            <p className="text-xs text-[#A7BAC4] mt-0.5">
              Edit the temporary test copy below (e.g. change a numeric value) to witness the SHA-256 cryptographic avalanche effect in real time. The genuine stored record is never corrupted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetPayload}
              className="px-3 py-1.5 text-xs text-[#A7BAC4] hover:text-white bg-white/5 rounded-xl border border-white/10 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Payload</span>
            </button>
            <button
              onClick={handleTestTamper}
              disabled={isVerifying}
              className="px-3.5 py-1.5 text-xs font-bold text-[#071722] bg-[#FFBF69] hover:bg-[#e0a658] rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Test Tampered Copy</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#A7BAC4] mb-1">
            Canonical Evidence Payload (Editable Sandbox Copy):
          </label>
          <textarea
            rows={5}
            value={tamperedPayload}
            onChange={(e) => setTamperedPayload(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-[#071722] text-[#8CE6E0] rounded-xl border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#19B8A5]"
          />
        </div>
      </div>

      {/* On-Chain Testnet Verification Details */}
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8CE6E0]" />
              <h3 className="text-sm font-bold text-[#F3F8FA]">
                {language === 'ta' ? 'பிளாக்செயின் டெஸ்ட்நெட் நங்கூரம்' : 'Blockchain Testnet Anchor Layer'}
              </h3>
            </div>
            <p className="text-xs text-[#A7BAC4] mt-0.5">
              Anchor content hash to Polygon Amoy Testnet for immutable third-party audit.
            </p>
          </div>

          <button
            onClick={handleRegisterOnChain}
            disabled={isRegisteringTestnet}
            className="px-4 py-2 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isRegisteringTestnet ? 'Anchoring...' : 'Anchor to Polygon Amoy'}</span>
          </button>
        </div>

        {currentSnapshot.proof?.proofType === 'testnet_anchor' || testnetTxResult ? (
          (() => {
            const activeProof = testnetTxResult || currentSnapshot.proof;
            const isReal = Boolean(activeProof?.isRealOnChain && activeProof?.transactionHash && activeProof?.onChainStatus === 'on_chain_confirmed');
            const isFailed = activeProof?.onChainStatus === 'failed' || activeProof?.onChainStatus === 'network_unreachable';

            if (isReal) {
              return (
                <div className="p-4 bg-[#19B8A5]/10 rounded-xl border border-[#19B8A5]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8CE6E0]">On-Chain Status: CONFIRMED ON-CHAIN</span>
                    <span className="font-mono text-[11px] text-[#A7BAC4]">Polygon Amoy (Chain ID 80002)</span>
                  </div>
                  <div className="font-mono text-[11px] break-all text-[#F3F8FA]">
                    Tx Hash: {activeProof.transactionHash}
                  </div>
                  {activeProof.blockNumber && (
                    <div className="font-mono text-[11px] text-[#8CE6E0]">
                      Block Number: #{activeProof.blockNumber}
                    </div>
                  )}
                  {activeProof.explorerUrl && (
                    <a
                      href={activeProof.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#19B8A5] hover:underline"
                    >
                      <span>View on PolygonScan Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            }

            if (isFailed) {
              return (
                <div className="p-4 bg-[#FF6268]/15 rounded-xl border border-[#FF6268]/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FF6268] flex items-center gap-1.5 font-mono">
                      <ShieldAlert className="w-4 h-4 text-[#FF6268]" />
                      ON-CHAIN SUBMISSION FAILED
                    </span>
                    <span className="font-mono text-[11px] text-[#A7BAC4]">Status: {activeProof?.onChainStatus?.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-[#F3F8FA] leading-relaxed">
                    {activeProof?.statusNotice || 'The EVM transaction could not be confirmed on-chain.'}
                  </p>
                  <div className="p-2.5 bg-black/40 rounded-lg font-mono text-[11px] text-[#A7BAC4] break-all">
                    Local Registered Digest: {activeProof?.registeredHash || currentSnapshot.contentHash}
                  </div>
                </div>
              );
            }

            const isUnverified = activeProof?.onChainStatus === 'unverified_network_unavailable';
            if (isUnverified) {
              return (
                <div className="p-4 bg-[#FFBF69]/15 rounded-xl border border-[#FFBF69]/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FFBF69] flex items-center gap-1.5 font-mono">
                      <HelpCircle className="w-4 h-4 text-[#FFBF69]" />
                      ON-CHAIN STATE UNVERIFIED (RPC UNAVAILABLE)
                    </span>
                    <span className="font-mono text-[11px] text-[#A7BAC4]">Polygon Amoy (Chain ID 80002)</span>
                  </div>
                  <p className="text-[11px] text-[#F3F8FA] leading-relaxed">
                    {activeProof?.statusNotice || 'A saved transaction hash exists in the local database, but live network re-verification could not be completed because the EVM RPC node is unreachable or unconfigured.'}
                  </p>
                  {activeProof?.transactionHash && (
                    <div className="font-mono text-[11px] break-all text-[#A7BAC4]">
                      Saved Tx Reference: {activeProof.transactionHash}
                    </div>
                  )}
                  <div className="p-2.5 bg-black/40 rounded-lg font-mono text-[11px] text-[#8CE6E0] break-all select-all">
                    Local Registered Digest: {activeProof?.registeredHash || currentSnapshot.contentHash}
                  </div>
                </div>
              );
            }

            return (
              <div className="p-4 bg-[#FFBF69]/10 rounded-xl border border-[#FFBF69]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FFBF69] flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#FFBF69] animate-pulse" />
                    TESTNET DEMONSTRATION MODE (UNSUBMITTED)
                  </span>
                  <span className="font-mono text-[11px] text-[#A7BAC4]">Polygon Amoy Testnet (Chain ID 80002)</span>
                </div>
                <p className="text-[11px] text-[#A7BAC4] leading-relaxed">
                  {activeProof?.statusNotice ||
                    'Real EVM RPC is unconfigured in server .env. No synthetic transaction hash or invented block number is generated. Cryptographic integrity is verified locally via deterministic RFC 8785 SHA-256 digest.'}
                </p>
                <div className="p-2.5 bg-black/40 rounded-lg font-mono text-[11px] text-[#8CE6E0] break-all select-all">
                  Local Registered Digest: {activeProof?.registeredHash || currentSnapshot.contentHash}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-[#A7BAC4]">
            This record currently holds local cryptographic proof (SHA-256 registered in ClimateLens database). Click &ldquo;Anchor to Polygon Amoy&rdquo; to test the testnet anchor flow.
          </div>
        )}

        {/* Crucial distinction disclaimer */}
        <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7BAC4] leading-relaxed">
          <strong>Crucial Distinction:</strong> Cryptographic and blockchain verification establishes that the retrieved record matches the exact bytes originally registered and has not been altered or tampered with. It proves provenance and integrity; it does not claim to make an imperfect sensor measurement infallible.
        </div>
      </div>

      {/* Independent Raw File Verification Section */}
      <RawFileVerifier />
    </div>
  );
};

const RawFileVerifier: React.FC = () => {
  const [pastedJson, setPastedJson] = useState('');
  const [claimedHash, setClaimedHash] = useState('');
  const [fileVerifyResult, setFileVerifyResult] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPastedJson(content);
    };
    reader.readAsText(file);
  };

  const handleVerifyRaw = async () => {
    if (!pastedJson.trim()) return;
    try {
      const res = await fetch('/api/v1/evidence/verify-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: pastedJson, claimedDigest: claimedHash }),
      });
      const data = await res.json();
      setFileVerifyResult(data);
    } catch (err) {
      console.error('File verification error:', err);
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Code2 className="w-4 h-4 text-[#8CE6E0]" />
        <h3 className="text-sm font-bold text-white">
          Independent File &amp; Raw JSON Verification
        </h3>
      </div>

      <p className="text-xs text-[#A7BAC4] leading-relaxed">
        Upload any downloaded <code className="text-white">.json</code> evidence snapshot or paste a payload to independently compute and audit its SHA-256 digest against an expected hash.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-[#A7BAC4] block">Upload JSON File:</label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="w-full text-xs text-[#A7BAC4] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono text-[#A7BAC4] block">Expected SHA-256 Hash (Optional for comparison):</label>
          <input
            type="text"
            placeholder="e.g. 9a31a986cb00fbfd53ff9d1078693c0bc133..."
            value={claimedHash}
            onChange={(e) => setClaimedHash(e.target.value)}
            className="w-full p-2.5 font-mono text-xs bg-[#071722] text-white rounded-xl border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#19B8A5]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-[#A7BAC4] block">Evidence Payload Content:</label>
        <textarea
          rows={4}
          placeholder='{"location":{"label":"Chennai"...'
          value={pastedJson}
          onChange={(e) => setPastedJson(e.target.value)}
          className="w-full p-3 font-mono text-xs bg-[#071722] text-[#8CE6E0] rounded-xl border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#19B8A5]"
        />
      </div>

      <button
        onClick={handleVerifyRaw}
        disabled={!pastedJson.trim()}
        className="px-4 py-2 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] text-xs font-bold rounded-xl transition-all disabled:opacity-40"
      >
        Calculate &amp; Verify Digest
      </button>

      {fileVerifyResult && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            fileVerifyResult.status === 'MATCH'
              ? 'bg-[#19B8A5]/10 border-[#19B8A5]/40 text-[#8CE6E0]'
              : fileVerifyResult.status === 'MISMATCH'
              ? 'bg-[#FF6268]/10 border-[#FF6268]/40 text-[#FF6268]'
              : 'bg-white/5 border-white/10 text-[#A7BAC4]'
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="font-bold">VERIFICATION RESULT: {fileVerifyResult.status}</span>
            <span>Algorithm: SHA-256</span>
          </div>
          <div className="font-mono text-[11px] break-all">
            Recalculated Digest: <strong className="text-white">{fileVerifyResult.recalculatedHash}</strong>
          </div>
          <p className="text-[11px] leading-relaxed pt-1">{fileVerifyResult.explanation}</p>
        </div>
      )}
    </div>
  );
};

