import React from 'react';
import { History, ArrowRight, ShieldCheck, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { EvidenceChange, EvidenceSnapshot } from '../services/api.ts';

interface HistoryTimelineProps {
  changes: EvidenceChange[];
  snapshots: EvidenceSnapshot[];
  onSelectSnapshot: (id: string) => void;
  language: 'en' | 'ta';
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  changes,
  snapshots,
  onSelectSnapshot,
  language,
}) => {
  return (
    <div className="space-y-6">
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <History className="w-5 h-5 text-[#19B8A5]" />
          <div>
            <h3 className="text-base font-bold text-[#F3F8FA]">
              {language === 'ta' ? 'என்ன மாறியது? (What Changed?) - சான்றுகள் காலவரிசை' : 'What Changed? — Evidence Evolution Timeline'}
            </h3>
            <p className="text-xs text-[#A7BAC4] mt-0.5">
              Chronological ledger tracking differences between successive atmospheric readings for the same location.
            </p>
          </div>
        </div>

        {changes.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#A7BAC4]">
            No multi-snapshot changes detected yet for current locations. Capturing multiple snapshots for the same city records automated value diffs.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {changes.map((chg) => {
              const prevSnapshot = snapshots.find((s) => s.id === chg.previousSnapshotId);
              const currSnapshot = snapshots.find((s) => s.id === chg.evidenceSnapshotId);

              return (
                <div
                  key={chg.id}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:border-[#19B8A5]/40 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#19B8A5] animate-ping" />
                      <span className="font-bold text-xs text-[#F3F8FA]">
                        {currSnapshot?.locationReference || 'Monitored Hub'}
                      </span>
                      <span className="text-[11px] text-[#A7BAC4] font-mono">
                        {new Date(chg.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectSnapshot(chg.evidenceSnapshotId)}
                        className="text-xs font-bold text-[#8CE6E0] hover:text-[#19B8A5] flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect Snapshot</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#F3F8FA] font-medium leading-relaxed">
                    {chg.changeSummary}
                  </p>

                  {/* Field diffs pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {Object.entries(chg.changedFields).map(([key, diff]) => (
                      <div key={key} className="p-2.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="text-[#A7BAC4] text-[11px] capitalize">{key}</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-[#A7BAC4] line-through">{diff.previous}</span>
                          <ArrowRight className="w-3 h-3 text-[#19B8A5]" />
                          <span className="font-bold text-[#8CE6E0]">{diff.current}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cryptographic reference */}
                  <div className="text-[10px] text-[#A7BAC4] font-mono flex items-center justify-between pt-1">
                    <span>Base: {chg.previousSnapshotId.substring(0, 14)}...</span>
                    <span>Current: {chg.evidenceSnapshotId.substring(0, 14)}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Snapshots Ledger */}
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-[#F3F8FA]">
          {language === 'ta' ? 'அனைத்து பதிவு செய்யப்பட்ட ஆதார ஆவணங்கள்' : 'All Recorded Evidence Snapshots in Immutable Store'}
        </h4>

        <div className="divide-y divide-white/10">
          {snapshots.map((s) => (
            <div key={s.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-semibold text-[#F3F8FA]">{s.locationReference}</div>
                <div className="text-[11px] text-[#A7BAC4] font-mono flex flex-wrap items-center gap-2 mt-0.5">
                  <span>{new Date(s.createdAt).toUTCString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#8CE6E0]">Origin: {s.dataOrigin}</span>
                  <span aria-hidden="true">·</span>
                  <span>Hash: {s.contentHash.substring(0, 16)}...</span>
                </div>
              </div>

              <button
                onClick={() => onSelectSnapshot(s.id)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-[#19B8A5] hover:text-[#071722] text-[#8CE6E0] rounded-xl border border-white/10 font-bold text-xs transition-all shrink-0 flex items-center gap-1 self-start sm:self-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Digest</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
